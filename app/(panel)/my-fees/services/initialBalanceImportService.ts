import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Una fila del Excel tal como se leyó. El saldo va crudo (número o texto con
 * formato colombiano): lo interpreta el backend, que es quien explica en cada
 * fila por qué no se pudo leer.
 */
export interface InitialBalanceImportRow {
  row: number;
  tower?: string;
  apartment?: string;
  amount?: string | number;
}

export interface InitialBalanceImportRequest {
  /** AAAA-MM-DD: el día en que se midieron los saldos. */
  cutoffDate: string;
  rows: InitialBalanceImportRow[];
}

export interface InitialBalanceImportResult {
  row: number;
  unit: string;
  status: "created" | "skipped" | "failed";
  amount?: number;
  reason?: string;
}

export interface InitialBalanceImportSummary {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  createdAmount: number;
  results: InitialBalanceImportResult[];
}

/** Máximo de filas por archivo; el mismo límite del backend. */
export const MAX_INITIAL_BALANCE_ROWS = 1000;

export interface InitialBalanceUnit {
  tower: string;
  apartment: string;
  hasInitialBalance: boolean;
}

/** Unidades del conjunto escritas como están registradas, para la plantilla. */
export async function initialBalanceUnitsService(
  conjuntoId: string,
): Promise<InitialBalanceUnit[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/initial-balance/units`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudieron traer las unidades");
  }

  return response.json();
}

export async function importInitialBalancesService(
  dto: InitialBalanceImportRequest,
  conjuntoId: string,
): Promise<InitialBalanceImportSummary> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/initial-balance/import`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(dto),
    },
  );

  if (!response.ok) {
    throw await backendError(
      response,
      "No se pudieron cargar los saldos iniciales",
    );
  }

  return response.json();
}
