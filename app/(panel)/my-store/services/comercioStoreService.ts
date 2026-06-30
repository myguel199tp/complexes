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
  stock: number;
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

export interface CreateOrderInput {
  branchId: string;
  items: OrderItemInput[];
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
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
