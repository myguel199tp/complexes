import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { UnknownQueryResponse } from "./response/unknownQueryResponse";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/unknown-queries`;

/**
 * Lo que el asistente no supo responder en este conjunto.
 *
 * El conjunto va en la cabecera y no en la ruta: el backend lo saca del guard
 * de todas formas, y mandarlo por query invitaría a que alguien probara con el
 * de otro edificio.
 */
export async function unknownQueriesService(
  conjuntoId: string,
  options: { includeReviewed?: boolean; limit?: number } = {},
): Promise<UnknownQueryResponse[]> {
  const params = new URLSearchParams();

  if (options.includeReviewed) params.set("includeReviewed", "true");
  if (options.limit) params.set("limit", String(options.limit));

  const query = params.toString();

  const response = await fetchWithAuth(`${BASE}${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar lo que el asistente no entendió");
  }

  return response.json();
}

/**
 * Da una pregunta por atendida y la saca del listado.
 *
 * Si vuelve a preguntarse reaparece sola: el backend la desmarca al registrarla
 * de nuevo, porque algo que se dio por visto y sigue llegando es que no quedó
 * resuelto.
 */
export async function reviewUnknownQueryService(
  conjuntoId: string,
  id: string,
): Promise<void> {
  const response = await fetchWithAuth(`${BASE}/${id}/reviewed`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo marcar la pregunta como revisada");
  }
}
