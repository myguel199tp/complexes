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
  items: ComercioOrderItem[];
  createdAt: string;
}

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
