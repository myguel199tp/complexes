import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Dónde vive el módulo de un paso en el panel. */
export interface AssistantGuidePlace {
  /** Adónde lleva "Llévame ahí". Sin ruta, solo se señala algo de la pantalla. */
  path?: string;
  /** Cómo se llega a mano: "Menú lateral → Cuotas". */
  menu: string;
  /** `data-guide` del elemento del menú a resaltar antes de navegar. */
  menuSpot?: string;
  /** Qué resaltar dentro de la pantalla: `data-guide` o "text:<texto>". */
  find?: string;
  /** Qué tocar una vez ahí. */
  howTo: string[];
}

export interface AssistantGuideStep {
  icon: string;
  title: string;
  text: string;
  points?: string[];
  place?: AssistantGuidePlace;
  /** Esto existe, pero en la app del celular (o al revés). */
  elsewhere?: "web" | "mobile";
}

/** La guía de bienvenida de Lary, ya armada para el rol de quien entra. */
export interface AssistantGuide {
  id: string;
  version: number;
  title: string;
  steps: AssistantGuideStep[];
  /** Cómo volver a verla, dicho con los botones que tiene este rol. */
  reopenHint: string;
}

export interface AssistantGuideState {
  /** null: el rol no tiene guía y no se muestra nada. */
  guide: AssistantGuide | null;
  /** Ya la vio (en este u otro aparato). Solo se abre sola si es false. */
  seen: boolean;
}

/**
 * El contenido y el "ya la vi" viven en el backend: la guía es la misma en el
 * panel y en la app, y quien la vio en el celular no la vuelve a recibir aquí.
 */
export class AssistantGuideService {
  async get(conjuntoId: string): Promise<AssistantGuideState> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assistant-guide/me?platform=web`,
      { headers: { "x-conjunto-id": conjuntoId } },
    );

    if (!response.ok) {
      throw new Error("No se pudo cargar la guía");
    }

    return response.json();
  }

  /**
   * No lanza: si falla, lo peor que pasa es que la guía vuelva a salir en el
   * próximo ingreso, y eso no justifica un error en pantalla.
   */
  async markSeen(conjuntoId: string, guideId: string): Promise<void> {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assistant-guide/me/seen`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-conjunto-id": conjuntoId,
          },
          body: JSON.stringify({ guideId }),
        },
      );
    } catch {
      // Ver arriba.
    }
  }
}
