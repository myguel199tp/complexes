import { deliveryFetch } from "../_lib/delivery-api";

/**
 * Pedidos y viajes del repartidor.
 *
 * El repartidor sólo mueve dos estados —salir a entregar y entregar— porque el
 * resto de la vida del pedido no le corresponde: confirmar es del comercio y
 * cancelar, del comercio o del cliente.
 */

export type ComercioOrderStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<ComercioOrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  assigned: "Por recoger",
  in_transit: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export interface DeliveryOrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  subtotal: number;
}

/** La plataforma no procesa el dinero: el repartidor lo recibe en la puerta. */
export type PaymentMethod =
  | "contraentrega_efectivo"
  | "contraentrega_datafono"
  | "transferencia";

export type PaymentStatus = "pending" | "reported" | "paid" | "rejected";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  contraentrega_efectivo: "Cobrar en efectivo",
  contraentrega_datafono: "Cobrar con datáfono",
  transferencia: "Ya pagado por transferencia",
};

export interface DeliveryOrder {
  id: string;
  status: ComercioOrderStatus;
  totalAmount: number;
  /**
   * De qué comercio y sucursal es. Viaja con el pedido desde que una persona
   * puede repartir para varios: sin esto no sabría a qué local ir a recogerlo.
   */
  comercio?: { id: string; businessName: string } | null;
  branch?: { id: string; name: string; address?: string } | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  assignedAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items: DeliveryOrderItem[];
}

/**
 * En qué está el repartidor. Es distinto de tener cuenta: sin esto el comercio
 * asignaba pedidos sin saber quién estaba en la calle.
 */
export type ShiftStatus = "available" | "busy" | "off";

export const SHIFT_LABELS: Record<ShiftStatus, string> = {
  available: "Disponible",
  busy: "Ocupado",
  off: "Fuera de turno",
};

export const SHIFT_TONE: Record<ShiftStatus, string> = {
  available: "text-emerald-400",
  busy: "text-amber-300",
  off: "text-slate-400",
};

export interface DeliveryProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  shiftStatus: ShiftStatus;
}

/** Un comercio y una sucursal donde el repartidor trabaja hoy. */
export interface DeliveryLink {
  linkId: string;
  comercioId: string;
  comercioName: string | null;
  branchId: string;
  branchName: string | null;
}

export function getMyLinks() {
  return deliveryFetch<DeliveryLink[]>("/delivery-auth/my-links");
}

export function setShift(status: ShiftStatus) {
  return deliveryFetch<DeliveryProfile>("/delivery-auth/shift", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Activación por invitación. No pasa por `deliveryFetch` porque todavía no hay
 * sesión —justamente lo que este paso crea—, así que va directo a la API.
 */
export async function activateAccount(
  deliveryId: string,
  token: string,
  password: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/delivery-auth/activate/${deliveryId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No pudimos activar la cuenta",
    );
  }

  return response.json() as Promise<{ success: boolean }>;
}

export function getDeliveryProfile() {
  return deliveryFetch<DeliveryProfile>("/delivery-auth/profile");
}

export function getMyDeliveryOrders(status?: ComercioOrderStatus) {
  const query = status ? `?status=${status}` : "";
  return deliveryFetch<DeliveryOrder[]>(`/delivery/orders${query}`);
}

/**
 * Las dos únicas transiciones del repartidor. El backend exige el orden
 * —`in_transit` sólo desde asignado, `delivered` sólo desde en camino—, así que
 * la pantalla ofrece una sola acción por pedido según dónde esté.
 */
export function markInTransit(id: string) {
  return deliveryFetch<DeliveryOrder>(`/delivery/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "in_transit" }),
  });
}

export function markDelivered(id: string) {
  return deliveryFetch<DeliveryOrder>(`/delivery/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "delivered" }),
  });
}

/**
 * Registra el cobro contraentrega. Lo marca el repartidor porque es quien tiene
 * el efectivo o el datáfono en la mano: que lo anote el comercio después
 * convierte el dato en memoria de alguien que no estuvo ahí.
 */
export function collectPayment(id: string) {
  return deliveryFetch<DeliveryOrder>(
    `/delivery/orders/${id}/payment/collect`,
    { method: "PATCH" },
  );
}

// ─────────────────────────── Viajes ───────────────────────────

export type DeliveryRunStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DeliveryRunStopStatus =
  | "pending"
  | "delivered"
  | "failed"
  | "revoked";

export interface DeliveryRunStop {
  id: string;
  orderId: string;
  deliveryAddress?: string | null;
  status: DeliveryRunStopStatus;
  deliveredAt?: string | null;
  notes?: string | null;
}

/**
 * Pase de acceso al conjunto. Es lo que el repartidor muestra en portería y
 * caduca a las tres horas de emitido.
 */
export interface DeliveryAccessPass {
  id: string;
  code: string;
  validFrom: string;
  validTo: string;
  usedAt?: string | null;
  revoked: boolean;
}

export interface DeliveryRun {
  id: string;
  status: DeliveryRunStatus;
  conjuntoId: string;
  conjunto?: { name?: string; address?: string } | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  stops: DeliveryRunStop[];
  accessPasses?: DeliveryAccessPass[];
}

export function getMyRuns() {
  return deliveryFetch<DeliveryRun[]>("/delivery/runs");
}

export function markStopDelivered(runId: string, stopId: string) {
  return deliveryFetch<DeliveryRun>(
    `/delivery/runs/${runId}/stops/${stopId}/delivered`,
    { method: "PATCH" },
  );
}
