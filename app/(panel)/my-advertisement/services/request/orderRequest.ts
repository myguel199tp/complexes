export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  MOBILE_PAY = "mobile_pay",
  ON_DELIVERY = "on_delivery",
  OTHER = "other",
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export interface ICreateOrderRequest {
  buyerId: string;
  sellerId: string;
  conjuntoId: string;
  unitId?: string;
  items: OrderItemDto[];
  message?: string;
  preferredPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
  noPlatformPayment?: boolean;
}
