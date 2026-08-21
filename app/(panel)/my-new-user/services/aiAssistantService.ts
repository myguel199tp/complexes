import { fetchEventSource } from "@microsoft/fetch-event-source";

import { AiAssistantResponse } from "./response/assistanServiceAi";
import { fetchWithAuth, toProxyUrl } from "@/app/helpers/fetchWithAuth";

/**
 * Los dos motores del asistente. `rules` es el de siempre: sin costo,
 * instantáneo y limitado a las frases que reconoce. `ai` pasa por un modelo de
 * lenguaje, entiende cualquier redacción y consume tokens que se pagan.
 */
export type AssistantMode = "rules" | "ai";

export interface AssistantModes {
  mode: AssistantMode;
  aiAvailable: boolean;
  /** Por qué no está disponible: el plan no lo incluye, o falta configurarlo. */
  reason?: "plan" | "not_configured";
}

export interface QuickSuggestion {
  icon: string;
  phrase: string;
}

export interface AssistantBootstrap {
  modes: AssistantModes;
  /**
   * Atajos del estado vacío, ya filtrados por el rol del usuario. No se
   * calculan aquí: las reglas de rol viven en el backend y replicarlas en web y
   * móvil garantiza que un día dejen de coincidir.
   */
  suggestions: QuickSuggestion[];
}

export interface AssistantAsk {
  message: string;
  conjuntoId: string;
  format: "text" | "table";
  mode: AssistantMode;
}

export interface AssistantStreamHandlers {
  /** Fase actual del procesamiento en el backend, para mostrarla mientras tanto. */
  onStatus?: (label: string) => void;
  /**
   * Fragmento incremental de la respuesta. En modo IA llegan los tokens según
   * el modelo los genera; en modo reglas no llega ninguno, porque el motor
   * resuelve la respuesta entera antes de poder escribir nada.
   */
  onToken?: (text: string) => void;
  onDone: (reply: AiAssistantResponse) => void;
  onError: (message: string) => void;
}

/**
 * Corta los reintentos automáticos de fetchEventSource.
 *
 * La librería está pensada para streams permanentes y reconecta sola cuando el
 * servidor cierra. Aquí cada stream es una pregunta con su respuesta: reabrirlo
 * volvería a lanzar la consulta —y a cobrarla contra la cuota del plan— sin que
 * el usuario haya pedido nada.
 */
class StreamClosed extends Error {}

export class AiAssistantService {
  /**
   * Envía la pregunta y recibe la respuesta por SSE.
   *
   * @param signal Permite cancelar desde la UI (el usuario cierra el chat o
   * manda otra pregunta antes de que termine la anterior).
   */
  /**
   * Motores disponibles y atajos sugeridos. Se consulta al abrir el chat: los
   * dos dependen de quién pregunta y se necesitan antes de la primera pregunta.
   */
  async getBootstrap(conjuntoId: string): Promise<AssistantBootstrap> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/bootstrap`,
      {
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("No se pudo preparar el asistente");
    }

    return response.json();
  }

  async streamMessage(
    ask: AssistantAsk,
    handlers: AssistantStreamHandlers,
    signal?: AbortSignal,
  ): Promise<void> {
    const { message, conjuntoId, format, mode } = ask;

    const url = toProxyUrl(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat/stream`,
    );

    let finished = false;

    try {
      await fetchEventSource(url, {
        method: "POST",
        signal,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify({ message, format, mode }),

        // Sin esto la librería cierra el stream al ocultarse la pestaña y lo
        // reabre al volver: el usuario que cambia de ventana mientras espera
        // perdería la respuesta y dispararía la consulta de nuevo.
        openWhenHidden: true,

        async onopen(response) {
          if (response.ok) return;

          if (response.status === 401) {
            throw new StreamClosed("SESSION_EXPIRED");
          }

          throw new StreamClosed("Error comunicándose con el asistente");
        },

        onmessage(event) {
          // Los latidos del servidor llegan como comentario y la librería los
          // descarta sola; lo que llega aquí sin nombre no es de este contrato.
          if (!event.event) return;

          switch (event.event) {
            case "status":
              handlers.onStatus?.(JSON.parse(event.data).label);
              return;

            case "token":
              handlers.onToken?.(JSON.parse(event.data).text);
              return;

            case "done":
              finished = true;
              handlers.onDone(JSON.parse(event.data) as AiAssistantResponse);
              return;

            case "error":
              finished = true;
              handlers.onError(JSON.parse(event.data).message);
              return;
          }
        },

        onclose() {
          throw new StreamClosed();
        },

        onerror(error) {
          // Devolver un número reintentaría; lanzar corta definitivamente.
          throw error instanceof StreamClosed
            ? error
            : new StreamClosed("Error comunicándose con el asistente");
        },
      });
    } catch (error) {
      // Cancelar desde la UI es una decisión del usuario, no un fallo.
      if (signal?.aborted) return;

      if (!finished) {
        handlers.onError(
          error instanceof StreamClosed && error.message
            ? error.message
            : "Error comunicándose con el asistente",
        );
      }
    }
  }

  /**
   * Ruta clásica sin streaming. Se conserva porque otras pantallas la usan y
   * porque es el recurso si el SSE no atraviesa alguna red corporativa.
   */
  async sendMessage(
    message: string,
    conjuntoId: string,
    format: "text" | "table" = "text",
  ): Promise<AiAssistantResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat/${format}`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error comunicándose con el asistente");
    }

    return response.json();
  }
}
