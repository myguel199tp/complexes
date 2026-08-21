import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Quién le alquila la celda al conjunto.
 *
 * La distinción no es cosmética: solo el residente genera cuota. `AdminFee`
 * cuelga de la unidad y toda la cartera se filtra por ella, así que un cobro a
 * un externo se guardaría sin aparecer en ningún listado ni proceso de mora.
 */
export type RentalTenantType = "RESIDENT" | "EXTERNAL";

export type RentalStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export const RENTAL_TENANT_TYPES: {
  value: RentalTenantType;
  label: string;
}[] = [
  { value: "RESIDENT", label: "Unidad del conjunto" },
  { value: "EXTERNAL", label: "Externo (sin apartamento)" },
];

export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  ACTIVE: "Vigente",
  ENDED: "Terminado",
  CANCELLED: "Anulado",
};

export interface ParkingRental {
  id: string;
  conjuntoId: string;
  spotId: string;
  spot?: { id: string; code: string; zone?: string | null; type: string } | null;
  tenantType: RentalTenantType;
  relationId?: string | null;
  relation?: {
    id: string;
    apartment?: string | null;
    tower?: string | null;
  } | null;
  tenantName: string;
  tenantDocument?: string | null;
  tenantPhone?: string | null;
  plate?: string | null;
  vehicleId?: string | null;
  startDate: string;
  endDate?: string | null;
  monthlyFee: number;
  billingDay: number;
  /** Último mes cobrado, `YYYY-MM`. Vacío mientras no se haya generado ninguno. */
  lastBilledPeriod?: string | null;
  status: RentalStatus;
  endedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateParkingRentalInput {
  spotId: string;
  tenantType: RentalTenantType;
  relationId?: string;
  tenantName?: string;
  tenantDocument?: string;
  tenantPhone?: string;
  plate?: string;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  billingDay?: number;
  notes?: string;
}

async function request<T>(
  path: string,
  conjuntoId: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // El backend responde con string o con array de errores de validación.
    const message =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : "Ocurrió un error inesperado";
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getParkingRentals(
  conjuntoId: string,
  filters: { status?: RentalStatus } = {},
) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return request<ParkingRental[]>(
    `/parking-rentals${query ? `?${query}` : ""}`,
    conjuntoId,
  );
}

export function createParkingRental(
  conjuntoId: string,
  data: CreateParkingRentalInput,
) {
  return request<ParkingRental>("/parking-rentals", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Cierra el contrato y devuelve la celda al inventario. */
export function endParkingRental(conjuntoId: string, id: string) {
  return request<ParkingRental>(`/parking-rentals/${id}/end`, conjuntoId, {
    method: "PATCH",
  });
}

/**
 * Anula un contrato mal cargado. A diferencia de terminarlo, dice que nunca
 * debió existir; las cuotas ya generadas se corrigen en cartera.
 */
export function cancelParkingRental(conjuntoId: string, id: string) {
  return request<ParkingRental>(`/parking-rentals/${id}/cancel`, conjuntoId, {
    method: "PATCH",
  });
}
