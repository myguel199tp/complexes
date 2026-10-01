import { comercioFetch } from "../../_lib/comercio-api";

/** Estado de la conexión con el asistente para clientes (ai-assistant-engine). */
export interface EngineLink {
  connected: boolean;
  tenantId: string | null;
  enabled: boolean;
  lastCallAt: string | null;
  /** La URL que se pega en "Tus datos" del panel del asistente. */
  connectorUrl: string | null;
  /** Si guardó la clave de servidor (nunca se devuelve la clave). */
  hasServerKey: boolean;
  /** Si los residentes ya pueden hablar con el asistente desde la app. */
  residentChatReady: boolean;
}

export function getEngineLink(): Promise<EngineLink> {
  return comercioFetch<EngineLink>("/comercio-ai/engine-link");
}

/** El secreto viaja una sola vez: el backend lo guarda cifrado y no lo devuelve. */
export function saveEngineLink(input: {
  tenantId: string;
  secret: string;
  /** Opcional: si no viene, el backend conserva la que había. */
  serverKey?: string;
}): Promise<EngineLink> {
  return comercioFetch<EngineLink>("/comercio-ai/engine-link", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function toggleEngineLink(enabled: boolean): Promise<EngineLink> {
  return comercioFetch<EngineLink>("/comercio-ai/engine-link", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export async function removeEngineLink(): Promise<void> {
  await comercioFetch<void>("/comercio-ai/engine-link", { method: "DELETE" });
}
