import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Historial de la administración del conjunto (`/api/admin-periods`): quién
 * fue la administración, desde cuándo, hasta cuándo y quién la dio de alta o
 * la retiró. Solo lectura; lo ven la administración y el consejo.
 */

export type AdminPeriodStartKind =
  | "registered"
  | "reactivated"
  | "detected"
  | "backfill";

export type AdminPeriodEndKind =
  | "retired"
  | "account_deactivated"
  | "role_changed"
  | "removed"
  | "detected";

export interface AdminPeriod {
  id: string;
  userId: string;
  adminName: string;
  adminEmail: string | null;
  startedAt: string;
  startedAtApproximate: boolean;
  startKind: AdminPeriodStartKind;
  startedByName: string | null;
  endedAt: string | null;
  endedAtApproximate: boolean;
  endKind: AdminPeriodEndKind | null;
  endedByName: string | null;
  endReason: string | null;
  isCurrent: boolean;
}

/** `at` (AAAA-MM-DD): solo quienes eran la administración ese día. */
export async function listAdminPeriods(
  conjuntoId: string,
  at?: string,
): Promise<AdminPeriod[]> {
  const query = at ? `?at=${encodeURIComponent(at)}` : "";
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-periods${query}`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  return response.json();
}
