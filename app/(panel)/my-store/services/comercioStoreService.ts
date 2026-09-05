import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PublicBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood?: string;
  phone?: string;
  comercio: {
    id: string;
    businessName: string;
    ownerName: string;
    phone: string;
    logoUrl?: string;
  };
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  /**
   * Unidades disponibles. `null` significa que el comercio no lleva inventario
   * de este artículo: se puede pedir sin tope. `0` sí es "agotado".
   */
  stock: number | null;
  isAvailable: boolean;
  images?: string[];
}

export type OrderItemType = "product" | "service";

export interface OrderItemInput {
  itemType: OrderItemType;
  productId?: string;
  serviceId?: string;
  quantity: number;
}

/**
 * Cómo se paga. La plataforma no procesa el dinero: va del residente al
 * comercio directamente y aquí sólo se registra lo acordado y si entró.
 */
export type PaymentMethod =
  | "contraentrega_efectivo"
  | "contraentrega_datafono"
  | "transferencia";

export type PaymentStatus = "pending" | "reported" | "paid" | "rejected";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  contraentrega_efectivo: "Efectivo al recibir",
  contraentrega_datafono: "Datáfono al recibir",
  transferencia: "Transferencia antes de la entrega",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Por pagar",
  reported: "Pago reportado, en verificación",
  paid: "Pagado",
  rejected: "Pago no verificado",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending: "text-gray-500",
  reported: "text-amber-600",
  paid: "text-emerald-600",
  rejected: "text-red-500",
};

/** Debe coincidir con el mínimo que valida el backend. */
export const PAYMENT_REFERENCE_MIN = 4;

export interface CreateOrderInput {
  branchId: string;
  items: OrderItemInput[];
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface MyOrderItem {
  id: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
}

export interface MyOrder {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "assigned"
    | "in_transit"
    | "delivered"
    | "cancelled";
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  cancelReason?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paymentRejectionReason?: string | null;
  paidAt?: string | null;
  items: MyOrderItem[];
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

export function getActiveBranches(conjuntoId: string) {
  return request<PublicBranch[]>(
    "/conjunto/comercio-orders/browse/branches",
    conjuntoId,
  );
}

export function getBranch(conjuntoId: string, branchId: string) {
  return request<PublicBranch>(
    `/conjunto/comercio-orders/browse/${branchId}`,
    conjuntoId,
  );
}

export function getBranchProducts(conjuntoId: string, branchId: string) {
  return request<PublicProduct[]>(
    `/conjunto/comercio-orders/browse/${branchId}/products`,
    conjuntoId,
  );
}

export function createStoreOrder(conjuntoId: string, data: CreateOrderInput) {
  return request<MyOrder>("/conjunto/comercio-orders", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyOrders(conjuntoId: string) {
  return request<MyOrder[]>("/conjunto/comercio-orders", conjuntoId);
}

export function cancelMyOrder(conjuntoId: string, id: string, reason: string) {
  return request<MyOrder>(`/conjunto/comercio-orders/${id}/cancel`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

/**
 * Reporta la transferencia. Va como multipart y **sin** cabecera
 * `Content-Type`: el navegador tiene que ponerla él para incluir el `boundary`,
 * y fijarla a mano rompe la petición.
 *
 * Queda en verificación, no pagado: el comercio es quien ve su cuenta.
 */
export async function reportMyPayment(
  conjuntoId: string,
  id: string,
  data: { reference: string; note?: string; receipt?: File },
) {
  const form = new FormData();
  form.append("reference", data.reference);
  if (data.note) form.append("note", data.note);
  if (data.receipt) form.append("receipt", data.receipt);

  const response = await fetchWithAuth(
    `${API_URL}/api/conjunto/comercio-orders/${id}/payment/report`,
    { method: "PATCH", headers: { "x-conjunto-id": conjuntoId }, body: form },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No pudimos reportar el pago",
    );
  }

  return response.json() as Promise<MyOrder>;
}
