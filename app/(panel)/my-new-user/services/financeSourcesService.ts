import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Rango inclusivo en formato "yyyy-MM-dd". Omitirlo trae todo el histórico. */
export interface PeriodRange {
  from?: string;
  to?: string;
}

/** Serie mensual de dinero: la misma forma para gastos e ingresos. */
export interface MonthlyMoneyRow {
  mes: string;
  total: number;
}

export interface MaintenanceCostSummary {
  byMonth: (MonthlyMoneyRow & { arreglos: number })[];
  total: number;
}

export interface ActivityRevenueSummary {
  byMonth: (MonthlyMoneyRow & { reservas: number })[];
  total: number;
}

function withRange(range: PeriodRange): string {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function getJson<T>(
  path: string,
  conjuntoId: string,
  range: PeriodRange,
): Promise<T> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/${path}${withRange(range)}`,
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

/**
 * Lo pagado a proveedores de mantenimiento. Vive en `maintenance_history` y
 * nunca se convierte en un `Expense`, así que el tablero lo pide aparte para
 * que el balance no ignore ese dinero.
 */
export function maintenanceCostService(
  conjuntoId: string,
  range: PeriodRange = {},
): Promise<MaintenanceCostSummary> {
  return getJson<MaintenanceCostSummary>("maintenances/costs", conjuntoId, range);
}

/** Recaudo por reservas de actividades de la comunidad. */
export function activityRevenueService(
  conjuntoId: string,
  range: PeriodRange = {},
): Promise<ActivityRevenueSummary> {
  return getJson<ActivityRevenueSummary>(
    "reservation-activity/revenue",
    conjuntoId,
    range,
  );
}
