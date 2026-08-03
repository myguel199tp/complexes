import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { PaginatedVisits } from "./response/VisitResponse";

export interface AllVisitParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  apartment?: string;
  from?: string;
  to?: string;
}

/**
 * El endpoint devolvía la bitácora completa del conjunto en cada request y el
 * filtrado se hacía en el navegador. Ahora la búsqueda y la paginación viajan al
 * servidor y la respuesta trae el sobre `{ data, total, page, limit }`.
 */
export async function allVisitService(
  conjuntoId: string,
  params: AllVisitParams = {},
): Promise<PaginatedVisits> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/allvisits${suffix}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
