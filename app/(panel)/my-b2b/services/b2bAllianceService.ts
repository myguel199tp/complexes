import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type B2bBillingPeriod = "mensual" | "semestral" | "anual";
export type B2bPricingModel = "fijo" | "por_apartamento";
export type B2bContractStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled";

export interface B2bComercio {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  phone?: string;
}

export interface B2bPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  isActive: boolean;
}

export interface B2bContract {
  id: string;
  comercioId: string;
  comercio?: { businessName: string };
  planName: string;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  quantityapt?: number;
  status: B2bContractStatus;
  notes?: string;
  rejectionReason?: string;
  nextPaymentDate?: string;
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

export function getB2bComercios(conjuntoId: string) {
  return request<B2bComercio[]>("/conjunto/b2b/comercios", conjuntoId);
}

export function getB2bComercioPlans(conjuntoId: string, comercioId: string) {
  return request<B2bPlan[]>(
    `/conjunto/b2b/comercios/${comercioId}/plans`,
    conjuntoId,
  );
}

export function requestB2bContract(
  conjuntoId: string,
  data: { planId: string; notes?: string },
) {
  return request<B2bContract>("/conjunto/b2b/contracts", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyB2bContracts(conjuntoId: string) {
  return request<B2bContract[]>("/conjunto/b2b/contracts", conjuntoId);
}

export function cancelB2bContract(conjuntoId: string, id: string) {
  return request<B2bContract>(
    `/conjunto/b2b/contracts/${id}/cancel`,
    conjuntoId,
    { method: "PATCH" },
  );
}
