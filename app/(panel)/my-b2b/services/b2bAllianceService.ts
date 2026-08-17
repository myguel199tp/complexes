import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type B2bBillingPeriod = "mensual" | "semestral" | "anual";
export type B2bPricingModel = "fijo" | "por_apartamento";
export type B2bContractStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled"
  /** Servicio cortado por mora. Al pagar lo vencido vuelve a activa. */
  | "suspended";

export type B2bInvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

/** Causales tipificadas exigidas al cancelar una alianza ya activa. */
export type B2bCancellationReason =
  | "incumplimiento"
  | "calidad"
  | "precio"
  | "cierre_servicio"
  | "cambio_proveedor"
  | "otro";

export const B2B_CANCELLATION_REASONS: {
  value: B2bCancellationReason;
  label: string;
}[] = [
  { value: "incumplimiento", label: "Incumplimiento del servicio" },
  { value: "calidad", label: "Calidad insatisfactoria" },
  { value: "precio", label: "Costo o condiciones económicas" },
  { value: "cierre_servicio", label: "Ya no necesitamos el servicio" },
  { value: "cambio_proveedor", label: "Cambio a otro proveedor" },
  { value: "otro", label: "Otro motivo" },
];

/** Debe coincidir con los mínimos que valida el backend. */
export const CANCEL_REASON_MIN_PENDING = 10;
export const CANCEL_REASON_MIN_ACTIVE = 30;

export interface B2bComercio {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  phone?: string;
  /** null cuando el comercio aún no tiene calificaciones. */
  ratingAverage: number | null;
  ratingCount: number;
}

export interface B2bRating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  conjuntoName: string;
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
  cancellationReason?: string;
  cancellationCategory?: B2bCancellationReason;
  confirmedAt?: string;
  cancelledAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  nextPaymentDate?: string;
  createdAt: string;
  /** true si la alianza llegó a estar activa y aún no se ha calificado. */
  canRate?: boolean;
  myRating?: { rating: number; comment?: string } | null;
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

/**
 * Cancela una alianza. El motivo es obligatorio siempre; `category` solo se
 * exige cuando la alianza estaba activa (el backend la ignora si estaba en
 * trámite).
 */
export function cancelB2bContract(
  conjuntoId: string,
  id: string,
  data: { reason: string; category?: B2bCancellationReason },
) {
  return request<B2bContract>(
    `/conjunto/b2b/contracts/${id}/cancel`,
    conjuntoId,
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

/** Califica al comercio de una alianza que llegó a estar activa. */
export function rateB2bComercio(
  conjuntoId: string,
  contractId: string,
  data: { rating: number; comment?: string },
) {
  return request<B2bRating>(
    `/conjunto/b2b/contracts/${contractId}/rating`,
    conjuntoId,
    { method: "POST", body: JSON.stringify(data) },
  );
}

/** Calificaciones publicadas de un comercio. */
export function getB2bComercioRatings(conjuntoId: string, comercioId: string) {
  return request<B2bRating[]>(
    `/conjunto/b2b/comercios/${comercioId}/ratings`,
    conjuntoId,
  );
}

export interface B2bInvoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  planName: string;
  comercioId: string;
  comercioName?: string | null;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  status: B2bInvoiceStatus;
  paidAt?: string | null;
  createdAt: string;
}

/** Lo que los proveedores B2B le han cobrado al conjunto. */
export function getMyB2bInvoices(
  conjuntoId: string,
  status?: B2bInvoiceStatus,
) {
  const query = status ? `?status=${status}` : "";
  return request<B2bInvoice[]>(`/conjunto/b2b/invoices${query}`, conjuntoId);
}
