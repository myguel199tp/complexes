import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioAssistantResponseType = "text" | "table";

export interface ComercioAssistantReply {
  type: ComercioAssistantResponseType;
  text: string;
  /** Filas de la tabla. Las columnas salen de las llaves del primer objeto. */
  data?: Record<string, unknown>[];
}

/**
 * El comercio no se envía nunca: el backend lo saca del token que valida
 * `ComercioJwtAuthGuard`. Mandarlo desde aquí permitiría consultar los pedidos
 * y contratos de otro comercio.
 */
export async function askComercioAssistant(
  message: string,
): Promise<ComercioAssistantReply> {
  return comercioFetch<ComercioAssistantReply>("/comercio-ai/chat/table", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/** Resumen inicial para la pantalla vacía del chat. */
export async function getComercioAssistantCapabilities(): Promise<ComercioAssistantReply> {
  return comercioFetch<ComercioAssistantReply>("/comercio-ai/capabilities");
}
