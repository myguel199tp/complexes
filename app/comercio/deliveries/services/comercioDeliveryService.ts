import { comercioFetch } from "../../_lib/comercio-api";

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
