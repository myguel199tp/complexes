import { PaymentMethod } from "../request/orderRequest";

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  PREPARING = "preparing",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum BookingStatus {
  REQUESTED = "requested",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pendiente",
  [OrderStatus.ACCEPTED]: "Aceptado",
  [OrderStatus.PREPARING]: "En preparación",
  [OrderStatus.COMPLETED]: "Entregado",
  [OrderStatus.REJECTED]: "Rechazado",
  [OrderStatus.CANCELLED]: "Cancelado",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.REQUESTED]: "Solicitada",
  [BookingStatus.CONFIRMED]: "Confirmada",
  [BookingStatus.COMPLETED]: "Prestada",
  [BookingStatus.REJECTED]: "Rechazada",
  [BookingStatus.CANCELLED]: "Cancelada",
  [BookingStatus.NO_SHOW]: "No asistida",
};

/** Estados en los que ya no se puede hacer nada con el pedido o la cita. */
export const CLOSED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.REJECTED,
  OrderStatus.CANCELLED,
];

export const CLOSED_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.COMPLETED,
  BookingStatus.REJECTED,
  BookingStatus.CANCELLED,
  BookingStatus.NO_SHOW,
];

export interface OrderItemResponse {
  id: string;
  productId: string;
  name?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  codigo?: string;
  buyerId: string;
  sellerId: string;
  conjuntoId: string;
  unitId?: string;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderItemResponse[];
  message?: string;
  sellerMessage?: string;
  cancellationReason?: string;
  preferredPaymentMethod?: PaymentMethod;
  confirmedPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
  closedAt?: string;
  createdAt: string;
}

export interface BookingResponse {
  id: string;
  codigo?: string;
  serviceId: string;
  sellerId: string;
  buyerId: string;
  conjuntoId: string;
  unitId?: string;
  serviceName?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  price: number;
  currency: string;
  status: BookingStatus;
  message?: string;
  sellerMessage?: string;
  cancellationReason?: string;
  preferredPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
  closedAt?: string;
  createdAt: string;
}

/** Franja libre devuelta por el endpoint de disponibilidad. */
export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  label: string;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: string;
  durationMinutes: number;
  reason?: "closed" | "no_schedule" | "out_of_range" | null;
  slots: AvailabilitySlot[];
}

export const AVAILABILITY_REASON_LABELS: Record<string, string> = {
  closed: "El negocio no atiende ese día",
  no_schedule: "El negocio aún no publicó su horario de atención",
  out_of_range: "Esa fecha está fuera del rango que acepta el vendedor",
};
