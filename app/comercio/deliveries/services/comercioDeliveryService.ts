import { comercioFetch } from "../../_lib/comercio-api";
import type {
  SettlementDetailBase,
  SettlementEntry,
  SettlementPayoutMethod,
  SettlementRowBase,
} from "@/app/delivery/services/deliverySettlementTypes";

// ─────────────────────────── Corte diario ───────────────────────────
//
// La plata no pasa por la plataforma: el efectivo que el repartidor cobra en
// la puerta es del comercio y el comercio le paga por fuera. Esto es el
// registro que los dos ven igual.

export interface ComercioSettlementRow extends SettlementRowBase {
  deliveryId: string;
  fullName: string | null;
  vehicleType: DeliveryVehicleType | null;
}

export interface ComercioSettlementOverview {
  day: string;
  today: string;
  rows: ComercioSettlementRow[];
  totals: { cashOwed: number; payOwed: number };
}

export interface ComercioSettlementDetail extends SettlementDetailBase {
  delivery: {
    id: string;
    fullName: string;
    phone: string;
    indicative: string | null;
    vehicleType: DeliveryVehicleType | null;
  } | null;
}

export function getSettlements(day?: string) {
  return comercioFetch<ComercioSettlementOverview>(
    `/comercio/delivery-settlements${day ? `?day=${day}` : ""}`,
  );
}

export function getSettlement(deliveryId: string, day?: string) {
  return comercioFetch<ComercioSettlementDetail>(
    `/comercio/delivery-settlements/${deliveryId}${day ? `?day=${day}` : ""}`,
  );
}

export function recordCashReceived(
  deliveryId: string,
  input: { amount: number; note?: string },
) {
  return comercioFetch<SettlementEntry>(
    `/comercio/delivery-settlements/${deliveryId}/cash-received`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function recordPayout(
  deliveryId: string,
  input: { amount: number; method: SettlementPayoutMethod; note?: string },
) {
  return comercioFetch<SettlementEntry>(
    `/comercio/delivery-settlements/${deliveryId}/payouts`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function voidSettlementEntry(entryId: string, reason: string) {
  return comercioFetch<SettlementEntry>(
    `/comercio/delivery-settlements/entries/${entryId}/void`,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}

export type DeliveryVehicleType =
  | "motorcycle"
  | "car"
  | "bicycle"
  | "walking"
  | "van";

/** Documentos con los que un repartidor puede identificarse. */
export type DeliveryDocumentType = "cc" | "ce" | "passport" | "ppt";

export const DOCUMENT_TYPE_LABELS: Record<DeliveryDocumentType, string> = {
  cc: "C.C.",
  ce: "C.E.",
  passport: "Pasaporte",
  ppt: "PPT",
};

/** En qué está el repartidor. Distinto de tener cuenta. */
export type ShiftStatus = "available" | "busy" | "off";

export const SHIFT_LABELS: Record<ShiftStatus, string> = {
  available: "Disponible",
  busy: "Ocupado",
  off: "Fuera de turno",
};

export const SHIFT_TONE: Record<ShiftStatus, string> = {
  available: "text-emerald-400",
  busy: "text-amber-300",
  off: "text-slate-500",
};

/**
 * Cómo se lee un repartidor al asignar: su turno y, si está ocupado, cuántas
 * entregas lleva. Desde que libre/ocupado lo calcula el sistema, el número es
 * real y no lo que el repartidor recordó marcar.
 */
export function deliveryLoadLabel(
  delivery: Pick<ComercioDelivery, "shiftStatus" | "activeOrders">,
): string {
  const load = delivery.activeOrders ?? 0;

  if (delivery.shiftStatus === "busy" && load > 0) {
    return `Ocupado · ${load} entrega${load === 1 ? "" : "s"}`;
  }
  return SHIFT_LABELS[delivery.shiftStatus];
}

/** Para ofrecer primero a quien está libre, luego al menos cargado. */
export function byAvailability(
  a: Pick<ComercioDelivery, "shiftStatus" | "activeOrders">,
  b: Pick<ComercioDelivery, "shiftStatus" | "activeOrders">,
): number {
  const rank = { available: 0, busy: 1, off: 2 } as const;
  return (
    rank[a.shiftStatus] - rank[b.shiftStatus] ||
    (a.activeOrders ?? 0) - (b.activeOrders ?? 0)
  );
}

export interface ComercioDelivery {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  indicative?: string | null;
  vehicleType?: DeliveryVehicleType | null;
  licensePlate?: string | null;
  /**
   * Lo declara él desde su app; el comercio sólo lo lee para decidir a quién
   * asignarle. Antes no existía y la asignación se hacía a ciegas.
   */
  shiftStatus: ShiftStatus;
  /**
   * Entregas que tiene encima ahora (de cualquier comercio: la moto es una).
   * "Ocupado" sin el número no dice si lleva una o cinco.
   */
  activeOrders?: number;
  isActive: boolean;
  /** Si ya puso su contraseña. Mientras sea false no puede entrar. */
  activated: boolean;
  /**
   * Si ya subió su foto y su documento. Es un paso posterior a activarse:
   * mientras sea false entra a la app pero no recibe pedidos.
   */
  identified: boolean;
  documentType?: DeliveryDocumentType | null;
  documentNumber?: string | null;
  /** Sucursales de este comercio donde trabaja. Puede ser más de una. */
  branches: { linkId: string; branchId: string }[];
  /**
   * Lo que le pagas por entrega (y el extra si es directa). Informativo: le
   * deja ver lo que lleva ganado. Nulo = no registrado.
   */
  payPerDelivery?: number | null;
  payPerPriority?: number | null;
  createdAt: string;
}

/** Lo que le pagas por entrega, en todas tus sucursales donde trabaja. */
export function setDeliveryPay(
  id: string,
  pay: { payPerDelivery: number | null; payPerPriority: number | null },
) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}/pay`, {
    method: "PATCH",
    body: JSON.stringify(pay),
  });
}

// ─────────────────────── Bolsa de repartidores ───────────────────────

export type JobDirection = "application" | "invitation";
export type JobStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Esperando respuesta",
  accepted: "Aceptada",
  rejected: "Rechazada",
  withdrawn: "Retirada",
  expired: "Venció",
};

/**
 * Lo que se ve de alguien de la bolsa antes de trabajar juntos. Sin
 * teléfono, correo ni documento: eso llega cuando acepta.
 */
export interface PoolCard {
  id: string;
  displayName: string;
  vehicleType: DeliveryVehicleType | null;
  workCity: string | null;
  availabilityNote: string | null;
  workBio: string | null;
  delivered: number;
  /** % de entregas que sí llegaron. Nulo sin historial. */
  completionRate: number | null;
  memberSince: string;
}

export interface PoolCandidate extends PoolCard {
  distanceKm: number;
  lastRequest: {
    id: string;
    direction: JobDirection;
    status: JobStatus;
    createdAt: string;
  } | null;
  canInvite: boolean;
}

export interface PoolRequest {
  id: string;
  direction: JobDirection;
  status: JobStatus;
  message: string | null;
  branchId: string;
  branchName: string | null;
  offeredPayPerDelivery: number | null;
  offeredPayPerPriority: number | null;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
  delivery: PoolCard | null;
}

export function getDeliveryPool(branchId: string) {
  return comercioFetch<PoolCandidate[]>(
    `/comercio/delivery-pool?branchId=${branchId}`,
  );
}

export function inviteFromPool(input: {
  deliveryId: string;
  branchId: string;
  message?: string;
  payPerDelivery?: number | null;
  payPerPriority?: number | null;
}) {
  return comercioFetch<PoolRequest>("/comercio/delivery-pool/invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPoolRequests(branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : "";
  return comercioFetch<PoolRequest[]>(`/comercio/delivery-pool/requests${query}`);
}

export function acceptApplication(
  id: string,
  pay: { payPerDelivery?: number | null; payPerPriority?: number | null },
) {
  return comercioFetch<{ success: boolean }>(
    `/comercio/delivery-pool/requests/${id}/accept`,
    { method: "PATCH", body: JSON.stringify(pay) },
  );
}

export function rejectApplication(id: string) {
  return comercioFetch<{ success: boolean }>(
    `/comercio/delivery-pool/requests/${id}/reject`,
    { method: "PATCH" },
  );
}

export function withdrawInvitation(id: string) {
  return comercioFetch<{ success: boolean }>(
    `/comercio/delivery-pool/requests/${id}/withdraw`,
    { method: "PATCH" },
  );
}

export function setBranchHiring(
  branchId: string,
  input: { hiring: boolean; note?: string },
) {
  return comercioFetch<{
    branchId: string;
    hiringDeliveries: boolean;
    hiringNote: string | null;
  }>(`/comercio/delivery-pool/branches/${branchId}/hiring`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export const VEHICLE_LABELS: Record<DeliveryVehicleType, string> = {
  motorcycle: "Moto",
  car: "Carro",
  bicycle: "Bicicleta",
  walking: "A pie",
  van: "Camioneta",
};

export const fmtMoney = (value: number) =>
  `$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

/**
 * Alta de un repartidor. **Sin contraseña**: se le manda una invitación y la
 * pone él. Que la escribiera el comercio significaba que el dueño conocía la
 * credencial de quien firma entregas en su nombre.
 */
export interface ComercioDeliveryInput {
  branchId: string;
  fullName: string;
  email: string;
  phone: string;
  indicative?: string;
  vehicleType?: DeliveryVehicleType;
  licensePlate?: string;
}

export function getDeliveries(branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : "";
  return comercioFetch<ComercioDelivery[]>(`/comercio/deliveries${query}`);
}

export function createDelivery(data: ComercioDeliveryInput) {
  return comercioFetch<ComercioDelivery>("/comercio/deliveries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDelivery(
  id: string,
  data: Partial<ComercioDeliveryInput>,
) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateDelivery(id: string) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}/deactivate`, {
    method: "PATCH",
  });
}

export function reactivateDelivery(id: string) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}/reactivate`, {
    method: "PATCH",
  });
}

/**
 * Reenvía la invitación a quien todavía no ha entrado. Para el que ya activó,
 * el camino es "recuperar contraseña": el comercio no debe poder reponerle la
 * credencial a alguien que ya la tiene.
 */
export function resendInvitation(id: string) {
  return comercioFetch<{ success: boolean }>(
    `/comercio/deliveries/${id}/resend-invitation`,
    { method: "POST" },
  );
}

/** Lo habilita en otra sucursal, en vez de crearle una segunda cuenta. */
export function addDeliveryBranch(id: string, branchId: string) {
  return comercioFetch<ComercioDelivery>(
    `/comercio/deliveries/${id}/branches/${branchId}`,
    { method: "POST" },
  );
}

/**
 * Abre la foto o el documento del repartidor.
 *
 * No son URLs directas: los archivos salen por un endpoint que comprueba que
 * quien pregunta sea un comercio con vínculo activo con esa persona, así que
 * hay que traerlos con la sesión y abrirlos como blob. Devuelve la URL
 * temporal y quien la use debe revocarla al cerrar.
 */
export async function fetchDeliveryIdentityFile(
  id: string,
  kind: "photo" | "document",
): Promise<string> {
  const response = await fetch(
    `/api/comercio/proxy/api/comercio/deliveries/${id}/identity/${kind}`,
    { credentials: "same-origin", cache: "no-store" },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No pudimos abrir el archivo",
    );
  }

  return URL.createObjectURL(await response.blob());
}
