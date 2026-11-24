import { fetchEventSource } from "@microsoft/fetch-event-source";

import { AiAssistantResponse } from "./response/assistanServiceAi";
import { fetchWithAuth, toProxyUrl } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

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

export type BriefingSeverity = "critical" | "warning" | "info" | "good";

export interface BriefingItem {
  key: string;
  icon: string;
  severity: BriefingSeverity;
  title: string;
  detail: string;
  /** `phrase` se manda al chat tal cual al tocar el botón. */
  action?: { label: string; phrase: string };
  /**
   * Deja apagar este punto del informe. Solo lo traen los que hablan de algo
   * que el conjunto puede decidir que no le interesa —hoy, las convocatorias de
   * otros conjuntos—: la mora no se descarta, se paga. `kind` dice a qué
   * servicio llamar; la ruta no viaja en el payload.
   */
  dismiss?: { label: string; kind: "b2b-demand"; id: string };
}

/**
 * Informe de entrada: el estado real de quien abre el chat —su cartera si es
 * residente, la del conjunto si administra— con lo que se puede hacer al
 * respecto. Es null si el backend no pudo armarlo.
 */
export interface AssistantBriefing {
  greeting: string;
  headline: string;
  items: BriefingItem[];
  /** La sección desde la que se abrió el chat, si el informe habla de ella. */
  section?: { id: string; label: string; icon: string };
}

/** Una sección del panel y las rutas que le corresponden. */
export interface AssistantSectionInfo {
  id: string;
  label: string;
  icon: string;
  routes: string[];
}

export interface AssistantBootstrap {
  modes: AssistantModes;
  /**
   * Atajos del estado vacío, ya filtrados por el rol del usuario. No se
   * calculan aquí: las reglas de rol viven en el backend y replicarlas en web y
   * móvil garantiza que un día dejen de coincidir.
   */
  suggestions: QuickSuggestion[];
  briefing: AssistantBriefing | null;
}

export interface AssistantAsk {
  message: string;
  conjuntoId: string;
  format: "text" | "table";
  mode: AssistantMode;
}

/** El archivo adjunto en el chat, tal como lo confirma el backend. */
export interface AssistantAttachment {
  name: string;
  size: number;
  mimetype: string;
}

/**
 * Lo mismo que acepta el backend: imágenes JPG, PNG o WEBP de hasta 5 MB y PDF
 * de hasta 8 MB. El PDF es para el comprobante de un pago, que Lary exige al
 * registrarlo.
 */
export const ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_PDF_MAX_BYTES = 8 * 1024 * 1024;
export const isPdfFile = (file: { type: string }) => file.type === "application/pdf";

/**
 * Excel de propietarios o de celdas, para que Lary lo cargue. Se mira la
 * extensión además del tipo: algunos navegadores en Windows no le ponen tipo
 * a un .xlsx.
 */
export const SHEET_ACCEPT =
  ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";
export const isSheetFile = (file: { name: string; type: string }) =>
  /\.(xlsx|xls)$/i.test(file.name) ||
  SHEET_ACCEPT.split(",").includes(file.type);

/** Topes del backend para el Excel del chat. */
const SHEET_MAX_ROWS = 1000;
const SHEET_MAX_COLUMNS = 30;
/** El servidor admite 100 KB de JSON; se deja margen para el resto del cuerpo. */
const SHEET_MAX_JSON = 95_000;

/** La primera hoja del Excel, en texto, como la espera el backend. */
export interface SheetUpload {
  fileName: string;
  headers: string[];
  rows: string[][];
}

/**
 * Lee el Excel en el navegador: el backend no tiene librería para hacerlo y
 * es lo mismo que hacen los modales de carga masiva. `xlsx` se carga aquí y no
 * arriba porque es pesada y casi nadie adjunta un Excel al chat.
 *
 * Lanza con un mensaje para el usuario si el archivo no sirve.
 */
export async function readSheet(file: File): Promise<SheetUpload> {
  const { read, utils } = await import("xlsx");

  let matrix: unknown[][];
  try {
    const wb = read(await file.arrayBuffer(), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    matrix = utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    });
  } catch {
    throw new Error("No pude leer el Excel. Verifica que sea un .xlsx válido.");
  }

  const text = (value: unknown) => String(value ?? "").trim();
  const [head = [], ...body] = matrix;
  const headers = head.map(text).slice(0, SHEET_MAX_COLUMNS);
  const rows = body
    .map((row) => headers.map((_, i) => text(row?.[i])))
    .filter((row) => row.some(Boolean));

  if (!headers.some(Boolean) || !rows.length) {
    throw new Error("El Excel está vacío: no encontré filas debajo de la cabecera.");
  }

  if (rows.length > SHEET_MAX_ROWS) {
    throw new Error(`El Excel trae ${rows.length} filas y el máximo es ${SHEET_MAX_ROWS}. Pártelo en varios archivos.`);
  }

  const sheet = { fileName: file.name, headers, rows };

  if (JSON.stringify(sheet).length > SHEET_MAX_JSON) {
    throw new Error("El Excel es muy grande para el chat. Pártelo en archivos más pequeños (por torre, por ejemplo).");
  }

  return sheet;
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
   *
   * @param path La ruta desde la que se abrió el chat: el saludo habla de esa
   * sección (en Actividades, de actividades). Qué ruta es qué sección lo decide
   * el backend, para no repetir la tabla aquí y en la app.
   */
  async getBootstrap(
    conjuntoId: string,
    path?: string,
  ): Promise<AssistantBootstrap> {
    const query = path ? `?path=${encodeURIComponent(path)}` : "";
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/bootstrap${query}`,
      {
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw await backendError(response, "No se pudo preparar el asistente");
    }

    return response.json();
  }

  /** Qué ruta es qué sección, para el globito de Lary. */
  async getSections(): Promise<AssistantSectionInfo[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/sections`,
    );

    if (!response.ok) {
      throw await backendError(response, "No se pudieron leer las secciones");
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
   * Descarta el hilo que el asistente recuerda en el servidor.
   *
   * El backend guarda los últimos intercambios media hora para poder entender
   * preguntas de seguimiento ("¿y en la torre 2?"). Como esta pantalla arranca
   * siempre en blanco, sin esto el usuario reabría el panel, veía un chat
   * vacío y el asistente seguía acordándose de lo anterior: contestaba a un
   * contexto que ya no está a la vista.
   *
   * No devuelve nada ni lanza: si falla, el chat se abre igual y lo único que
   * pasa es que el hilo viejo sobrevive hasta que caduque solo.
   */
  async resetConversation(conjuntoId: string): Promise<void> {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/history`,
        {
          method: "DELETE",
          headers: { "x-conjunto-id": conjuntoId },
          credentials: "include",
        },
      );
    } catch {
      // Silencio a propósito: ver arriba.
    }
  }

  /**
   * Adjunta una imagen al chat: la foto de una noticia, de una actividad o la
   * evidencia de un mantenimiento.
   *
   * Se sube aparte y no con el mensaje porque el chat viaja como JSON por SSE,
   * y porque la imagen se usa turnos después: el asistente arma la noticia, la
   * muestra, y solo al confirmar se publica con la foto. Adjuntar otra
   * reemplaza la anterior.
   *
   * Lanza con el mensaje del backend si la rechaza (tipo o tamaño).
   */
  async attachImage(
    file: File,
    conjuntoId: string,
  ): Promise<AssistantAttachment> {
    const body = new FormData();
    body.append("file", file);

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/attachments`,
      {
        method: "POST",
        body,
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      let message = "No se pudo adjuntar la imagen";
      try {
        const data = await response.json();
        const detail = Array.isArray(data?.message) ? data.message[0] : data?.message;
        if (typeof detail === "string" && detail.trim()) message = detail;
      } catch {
        // Sin cuerpo legible queda el mensaje genérico.
      }
      throw new Error(message);
    }

    return response.json();
  }

  /**
   * Adjunta un Excel de propietarios o de celdas ya leído (`readSheet`). Lary
   * lo convierte en una propuesta de carga con el siguiente mensaje y solo
   * registra con el "sí".
   *
   * Lanza con el mensaje del backend si lo rechaza (columnas, permisos).
   */
  async attachSheet(
    sheet: SheetUpload,
    conjuntoId: string,
  ): Promise<{ name: string; rows: number }> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/attachments/sheet`,
      {
        method: "POST",
        body: JSON.stringify(sheet),
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Solo la administración puede cargar un Excel por el chat.");
      }

      let message = "No se pudo adjuntar el Excel";
      try {
        const data = await response.json();
        const detail = Array.isArray(data?.message) ? data.message[0] : data?.message;
        if (typeof detail === "string" && detail.trim()) message = detail;
      } catch {
        // Sin cuerpo legible queda el mensaje genérico.
      }
      throw new Error(message);
    }

    return response.json();
  }

  /**
   * Quita la imagen adjunta. No lanza: si falla, la imagen caduca sola en el
   * servidor a la media hora, y el resumen de la próxima acción la mostraría
   * antes de confirmar.
   */
  async removeAttachment(conjuntoId: string): Promise<void> {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/attachments`,
        {
          method: "DELETE",
          headers: { "x-conjunto-id": conjuntoId },
        },
      );
    } catch {
      // Ver arriba.
    }
  }

  /**
   * Califica una respuesta: el pulgar arriba o abajo del chat.
   *
   * Es la única medida honesta de si el asistente acierta. El backend da la
   * consulta por resuelta en cuanto alguno de sus módulos devuelve texto, y
   * "devolvió texto" no es lo mismo que "contestó lo que le preguntaron": una
   * respuesta que habla de otra cosa se registra hoy como éxito.
   *
   * No lanza. El voto es un extra sobre una conversación que ya funcionó, y
   * romperle el chat a alguien por no poder guardar su opinión sería cambiar
   * algo que importa por algo que no. Devuelve si se guardó, para que la
   * pantalla pueda retirar el pulgar que pintó de más.
   */
  async sendFeedback(
    usageId: string,
    conjuntoId: string,
    helpful: boolean,
    comment?: string,
  ): Promise<boolean> {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/feedback/${usageId}`,
        {
          method: "POST",
          body: JSON.stringify({ helpful, comment }),
          headers: {
            "Content-Type": "application/json",
            "x-conjunto-id": conjuntoId,
          },
          credentials: "include",
        },
      );

      return response.ok;
    } catch {
      return false;
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
      throw await backendError(response, "Error comunicándose con el asistente");
    }

    return response.json();
  }
}
