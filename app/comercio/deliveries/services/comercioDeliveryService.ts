import { comercioFetch } from "../../_lib/comercio-api";

export type DeliveryVehicleType =
  | "motorcycle"
  | "car"
  | "bicycle"
  | "walking"
  | "van";

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
  isActive: boolean;
  /** Si ya puso su contraseña. Mientras sea false no puede entrar. */
  activated: boolean;
  /** Sucursales de este comercio donde trabaja. Puede ser más de una. */
  branches: { linkId: string; branchId: string }[];
  createdAt: string;
}

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
