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
  /** Correo del externo: ahí le llega cada mes el link de pago. */
  tenantEmail?: string | null;
  /** CONJUNTO: celda común. RESIDENT: alquiler entre residentes. */
  landlordType?: "CONJUNTO" | "RESIDENT";
  landlordRelation?: {
    id: string;
    apartment?: string | null;
    tower?: string | null;
  } | null;
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
  tenantEmail?: string;
  plate?: string;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  billingDay?: number;
  notes?: string;
}

export type RentalChargeStatus = "PENDING" | "PAID" | "CANCELLED";

export const CHARGE_STATUS_LABEL: Record<RentalChargeStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  CANCELLED: "Anulado",
};

/**
 * Un mes de canon que se paga por link (externos y alquiler entre residentes),
 * con el cargo de la plataforma encima.
 */
export interface ParkingRentalCharge {
  id: string;
  rentalId: string;
  period: string;
  payee: "CONJUNTO" | "RESIDENT";
  canon: number;
  feeAmount: number;
  taxAmount: number;
  total: number;
  status: RentalChargeStatus;
  dueDate: string;
  paidAt?: string | null;
  payUrl: string | null;
  rental?: ParkingRental | null;
}

export type ListingStatus =
  | "PENDING"
  | "OPEN"
  | "REJECTED"
  | "RENTED"
  | "CLOSED";

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  PENDING: "Por aprobar",
  OPEN: "Publicada",
  REJECTED: "Rechazada",
  RENTED: "Alquilada",
  CLOSED: "Retirada",
};

/** Celda que ofrece un residente, vista por la administración. */
export interface AdminParkingListing {
  id: string;
  spotCode?: string;
  zone?: string | null;
  owner: string;
  ownerName?: string | null;
  monthlyPrice: number;
  description?: string | null;
  status: ListingStatus;
  rejectionReason?: string | null;
  createdAt: string;
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

/** Cobros por link del conjunto, con su link de pago. */
export function getRentalCharges(
  conjuntoId: string,
  status?: RentalChargeStatus,
) {
  return request<ParkingRentalCharge[]>(
    `/parking-rentals/charges${status ? `?status=${status}` : ""}`,
    conjuntoId,
  );
}

/** Lo cobraron por fuera o lo condonaron: deja de estar pendiente. */
export function cancelRentalCharge(conjuntoId: string, chargeId: string) {
  return request<ParkingRentalCharge>(
    `/parking-rentals/charges/${chargeId}/cancel`,
    conjuntoId,
    { method: "PATCH" },
  );
}

export function getResidentRentalSettings(conjuntoId: string) {
  return request<{ enabled: boolean }>(
    "/parking-rentals/resident-rentals/settings",
    conjuntoId,
  );
}

export function updateResidentRentalSettings(
  conjuntoId: string,
  enabled: boolean,
) {
  return request<{ enabled: boolean }>(
    "/parking-rentals/resident-rentals/settings",
    conjuntoId,
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  );
}

export function getAdminListings(conjuntoId: string) {
  return request<AdminParkingListing[]>(
    "/parking-rentals/resident-rentals/listings",
    conjuntoId,
  );
}

export function approveListing(conjuntoId: string, listingId: string) {
  return request<unknown>(
    `/parking-rentals/resident-rentals/listings/${listingId}/approve`,
    conjuntoId,
    { method: "PATCH" },
  );
}

export function rejectListing(
  conjuntoId: string,
  listingId: string,
  reason?: string,
) {
  return request<unknown>(
    `/parking-rentals/resident-rentals/listings/${listingId}/reject`,
    conjuntoId,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}
