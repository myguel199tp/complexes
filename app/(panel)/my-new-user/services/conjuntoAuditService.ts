import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Bitácora del conjunto (`/api/conjunto-audit`): quién publicó o borró
 * noticias y documentos, subió certificados, cambió cuentas bancarias y
 * convenios, traspasó unidades o borró residentes. Solo lectura; la ven la
 * administración y el consejo.
 */

export type ConjuntoAuditEntity =
  | "news"
  | "record"
  | "certification"
  | "bank_account"
  | "collection_agreement"
  | "ownership"
  | "resident"
  | "admin"
  | "council";

export interface ConjuntoAuditEntry {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entityType: ConjuntoAuditEntity;
  entityId: string | null;
  summary: string;
  details: Record<string, unknown> | null;
}

export interface ConjuntoAuditPage {
  items: ConjuntoAuditEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface ConjuntoAuditFilters {
  actorId?: string;
  entityType?: ConjuntoAuditEntity | "";
  /** AAAA-MM-DD o fecha y hora ISO. */
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function listConjuntoAudit(
  conjuntoId: string,
  filters: ConjuntoAuditFilters = {},
): Promise<ConjuntoAuditPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjunto-audit?${params}`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  return response.json();
}
