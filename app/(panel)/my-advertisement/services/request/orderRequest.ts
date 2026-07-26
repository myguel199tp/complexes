export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  MOBILE_PAY = "mobile_pay",
  ON_DELIVERY = "on_delivery",
  OTHER = "other",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.BANK_TRANSFER]: "Transferencia bancaria",
  [PaymentMethod.MOBILE_PAY]: "Nequi / Daviplata",
  [PaymentMethod.ON_DELIVERY]: "Contra entrega",
  [PaymentMethod.OTHER]: "Otro",
};

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

/**
 * `buyerId` y `conjuntoId` ya no viajan: el backend los toma del token y del
 * header `x-conjunto-id`. Mandarlos era lo que permitía pedir a nombre de otro
 * vecino, y además era la causa de que el formulario nunca pasara la
 * validación (el schema los exigía y nadie los llenaba).
 */
export interface ICreateOrderRequest {
  sellerId: string;
  unitId?: string;
  items: OrderItemDto[];
  message?: string;
  preferredPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
}

/** Solicitud de cita para un servicio. */
export interface ICreateBookingRequest {
  serviceId: string;
  /** ISO con zona horaria, tal como lo devuelve el endpoint de disponibilidad. */
  startAt: string;
  unitId?: string;
  message?: string;
  preferredPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
}

export interface IRateSellerRequest {
  rating: number;
  comment?: string;
}
