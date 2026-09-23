import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

import {
  KnowledgeEntry,
  KnowledgePayload,
  UnknownQuery,
} from "./response/knowledgeResponse";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant`;

/**
 * El conjunto viaja en la cabecera y nunca en el cuerpo ni en la URL.
 *
 * Es lo mismo que hace el chat, y por el mismo motivo: el backend resuelve el
 * conjunto desde ahí y comprueba que quien pregunta pertenece a él. Lo que se
 * escribe en esta pantalla sale después por boca del asistente, así que
 * equivocarse de edificio sería responderle a unos vecinos con el manual de
 * otros.
 */
function headers(conjuntoId: string) {
  return {
    "Content-Type": "application/json",
    "x-conjunto-id": conjuntoId,
  };
}

export async function listKnowledge(
  conjuntoId: string,
  includeInactive = false,
): Promise<KnowledgeEntry[]> {
  const response = await fetchWithAuth(
    `${BASE}/knowledge?includeInactive=${includeInactive}`,
    { method: "GET", headers: headers(conjuntoId) },
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar lo que sabe el asistente");
  }

  return response.json();
}

/**
 * Lo que el asistente no supo responder en este conjunto.
 *
 * Se pide junto con el listado al abrir la pantalla: las dos mitades cuentan la
 * misma historia —lo que sabe y lo que le falta— y verlas por separado
 * obligaría a recordar una mientras se mira la otra.
 */
export async function listUnknownQueries(
  conjuntoId: string,
): Promise<UnknownQuery[]> {
  const response = await fetchWithAuth(`${BASE}/unknown-queries`, {
    method: "GET",
    headers: headers(conjuntoId),
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las preguntas sin responder");
  }

  return response.json();
}

/**
 * Enseña una respuesta nueva.
 *
 * Si lleva `sourceQueryId`, el backend da por atendida la pregunta de la que
 * nació en el mismo paso: quien escribió la respuesta ya la resolvió, y pedirle
 * además que marque una casilla sería inventarle un trámite.
 */
export async function createKnowledge(
  conjuntoId: string,
  payload: KnowledgePayload,
): Promise<KnowledgeEntry> {
  const response = await fetchWithAuth(`${BASE}/knowledge`, {
    method: "POST",
    headers: headers(conjuntoId),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "No se pudo guardar"));
  }

  return response.json();
}

export async function updateKnowledge(
  conjuntoId: string,
  id: string,
  payload: Partial<KnowledgePayload> & { active?: boolean },
): Promise<KnowledgeEntry> {
  const response = await fetchWithAuth(`${BASE}/knowledge/${id}`, {
    method: "PATCH",
    headers: headers(conjuntoId),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "No se pudo actualizar"));
  }

  return response.json();
}

export async function removeKnowledge(
  conjuntoId: string,
  id: string,
): Promise<void> {
  const response = await fetchWithAuth(`${BASE}/knowledge/${id}`, {
    method: "DELETE",
    headers: headers(conjuntoId),
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la entrada");
  }
}

/**
 * El mensaje que manda el backend, si mandó alguno.
 *
 * Importa aquí más que en otras pantallas: los errores útiles de este formulario
 * son suyos —la pregunta es demasiado corta para reconocerla, ya existe otra
 * igual— y taparlos con un "no se pudo guardar" dejaría al administrador
 * intentando lo mismo sin saber qué cambiar.
 */
async function errorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    const message = body?.message;

    if (Array.isArray(message)) return message.join(". ");
    if (typeof message === "string") return message;
  } catch {
    // Sin cuerpo útil: se queda el genérico.
  }

  return fallback;
}
