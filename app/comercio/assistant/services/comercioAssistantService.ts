import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioAssistantResponseType = "text" | "table";

export interface ComercioAssistantReply {
  type: ComercioAssistantResponseType;
  text: string;
  /** Filas de la tabla. Las columnas salen de las llaves del primer objeto. */
  data?: Record<string, unknown>[];
  /**
   * Con qué se vota esta respuesta. Solo viene cuando el backend la registró y
   * tiene sentido votarla: sin él no se pintan los pulgares.
   */
  usageId?: string;
}

/**
 * Vota una respuesta. No lanza: devuelve si se guardó, y la pantalla retira el
 * pulgar si no. Un voto perdido no merece un error en medio de la charla.
 */
export async function sendComercioAssistantFeedback(
  usageId: string,
  helpful: boolean,
): Promise<boolean> {
  try {
    await comercioFetch(`/comercio-ai/feedback/${usageId}`, {
      method: "POST",
      body: JSON.stringify({ helpful }),
    });
    return true;
  } catch {
    return false;
  }
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

/**
 * Empieza una conversación nueva en el servidor.
 *
 * El backend recuerda las últimas preguntas para entender un "¿y ayer?". La
 * pantalla arranca en blanco, así que la memoria del servidor también tiene
 * que hacerlo: si no, el primer "¿y ayer?" continuaría una pregunta que el
 * dueño ya no ve.
 */
export async function resetComercioAssistantConversation(): Promise<void> {
  await comercioFetch<void>("/comercio-ai/history", { method: "DELETE" });
}

/** Si el comercio recibe el resumen semanal por correo los lunes. */
export async function getWeeklyDigestEnabled(): Promise<boolean> {
  const { enabled } = await comercioFetch<{ enabled: boolean }>(
    "/comercio-ai/digest/settings",
  );
  return enabled;
}

export async function setWeeklyDigestEnabled(enabled: boolean): Promise<boolean> {
  const result = await comercioFetch<{ enabled: boolean }>(
    "/comercio-ai/digest/settings",
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  );
  return result.enabled;
}

/** Resumen inicial para la pantalla vacía del chat. */
export async function getComercioAssistantCapabilities(): Promise<ComercioAssistantReply> {
  return comercioFetch<ComercioAssistantReply>("/comercio-ai/capabilities");
}
