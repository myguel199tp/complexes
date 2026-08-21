import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface VisitStats {
  totalVisits: number;
  parkingUsage: { with: number; without: number };
  paymentStatusBreakdown: { name: string; value: number }[];
  parkingRevenueByMonth: { mes: string; total: number }[];
  parkingRevenueTotal: number;
}

/** Rango inclusivo en formato "yyyy-MM-dd". Omitirlo trae todo el histórico. */
export interface VisitStatsRange {
  from?: string;
  to?: string;
}

/**
 * El tablero agregaba en el navegador sobre la bitácora completa del conjunto.
 * Con `allvisits` paginado esas cifras habrían quedado reducidas a una página,
 * así que los agregados los calcula el backend en SQL.
 */
export async function visitStatsService(
  conjuntoId: string,
  range: VisitStatsRange = {},
): Promise<VisitStats> {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);

  const query = params.toString();

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/stats${query ? `?${query}` : ""}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
