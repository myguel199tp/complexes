import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioOrderStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface ComercioOrderItem {
  id: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
}

export interface ComercioOrder {
  id: string;
  status: ComercioOrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
  notes?: string;
  cancelReason?: string;
  deliveryId?: string;
  delivery?: { id: string; fullName: string };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paymentReceiptPath?: string | null;
  paymentReportedAt?: string | null;
  paidAt?: string | null;
  paymentConfirmedBy?: "comercio" | "delivery" | null;
  paymentRejectionReason?: string | null;
  items: ComercioOrderItem[];
  createdAt: string;
}

/**
 * La plataforma no procesa el dinero: va del residente al comercio
 * directamente. Aquí sólo se registra lo acordado y si entró.
 */
export type PaymentMethod =
  | "contraentrega_efectivo"
  | "contraentrega_datafono"
  | "transferencia";

export type PaymentStatus = "pending" | "reported" | "paid" | "rejected";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  contraentrega_efectivo: "Efectivo contraentrega",
  contraentrega_datafono: "Datáfono contraentrega",
  transferencia: "Transferencia",
};

/** Rótulos desde el lado del comercio: es el mismo estado leído como cobro. */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Sin cobrar",
  reported: "Por verificar",
  paid: "Cobrado",
  rejected: "Rechazado",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending: "text-slate-400",
  reported: "text-amber-300",
  paid: "text-emerald-400",
  rejected: "text-red-400",
};

/** Debe coincidir con el mínimo que valida el backend. */
export const PAYMENT_REJECTION_REASON_MIN = 10;

export function getOrders(status?: ComercioOrderStatus) {
  const query = status ? `?status=${status}` : "";
  return comercioFetch<ComercioOrder[]>(`/comercio/orders${query}`);
}

export function confirmOrder(id: string) {
  return comercioFetch<ComercioOrder>(`/comercio/orders/${id}/confirm`, {
    method: "PATCH",
  });
}

export function cancelOrder(id: string, reason: string) {
  return comercioFetch<ComercioOrder>(`/comercio/orders/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function assignDelivery(id: string, deliveryId: string) {
  return comercioFetch<ComercioOrder>(`/comercio/orders/${id}/assign-delivery`, {
    method: "PATCH",
    body: JSON.stringify({ deliveryId }),
  });
}

export function confirmPayment(id: string) {
  return comercioFetch<ComercioOrder>(
    `/comercio/orders/${id}/payment/confirm`,
    { method: "PATCH" },
  );
}

export function rejectPayment(id: string, reason: string) {
  return comercioFetch<ComercioOrder>(`/comercio/orders/${id}/payment/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

/**
 * URL del comprobante. Va por el proxy del dominio comercio: el token vive en
 * una cookie httpOnly, así que un enlace directo a la API llegaría sin
 * credenciales.
 */
export function paymentReceiptUrl(id: string) {
  return `/api/comercio/proxy/api/comercio/orders/${id}/payment/receipt`;
}
