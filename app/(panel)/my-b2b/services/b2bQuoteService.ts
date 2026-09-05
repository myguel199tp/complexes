import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import type { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Cotizaciones del conjunto.
 *
 * El catálogo de planes sirve cuando el precio no depende del edificio; para
 * impermeabilizar una cubierta o pintar una fachada el precio sale de una
 * visita, y eso es lo que se pide por aquí.
 */

export type B2bQuoteStatus =
  | "requested"
  | "visit_scheduled"
  | "quoted"
  | "accepted"
  | "rejected"
  | "declined"
  | "expired"
  | "cancelled";

/** Único = obra que se cobra una vez; recurrente = se factura cada periodo. */
export type B2bQuoteKind = "unico" | "recurrente";

/** Debe coincidir con los mínimos que valida el backend. */
export const QUOTE_DESCRIPTION_MIN = 30;
export const QUOTE_CLOSING_REASON_MIN = 10;

export const QUOTE_STATUS_LABELS: Record<B2bQuoteStatus, string> = {
  requested: "Esperando al proveedor",
  visit_scheduled: "Visita agendada",
  quoted: "Cotizada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  declined: "El proveedor no cotizó",
  expired: "Vencida",
  cancelled: "Retirada",
};

/** Colores del estado. `quoted` resalta porque es el que pide una decisión. */
export const QUOTE_STATUS_TONE: Record<B2bQuoteStatus, string> = {
  requested: "text-slate-400",
  visit_scheduled: "text-blue-300",
  quoted: "text-emerald-300",
  accepted: "text-emerald-400",
  rejected: "text-slate-500",
  declined: "text-amber-300",
  expired: "text-amber-400",
  cancelled: "text-slate-500",
};

export interface B2bQuote {
  id: string;
  quoteNumber: string;
  status: B2bQuoteStatus;
  comercioId: string;
  comercioName: string | null;
  demandId: string | null;
  category: B2bServiceCategory;
  categoryOther: string | null;
  title: string;
  description: string;
  desiredStartDate: string | null;
  quantityapt: number | null;
  visitScheduledAt: string | null;
  visitNotes: string | null;
  price: number | null;
  amount: number | null;
  currency: string;
  kind: B2bQuoteKind | null;
  billingPeriod: string | null;
  pricingModel: string | null;
  scope: string | null;
  validUntil: string | null;
  respondedAt: string | null;
  contractId: string | null;
  acceptedAt: string | null;
  closingReason: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface CreateB2bQuoteInput {
  comercioId: string;
  category: B2bServiceCategory;
  categoryOther?: string;
  title: string;
  description: string;
  desiredStartDate?: string;
  demandId?: string;
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

export function getMyQuotes(conjuntoId: string, status?: B2bQuoteStatus) {
  const query = status ? `?status=${status}` : "";
  return request<B2bQuote[]>(`/conjunto/b2b/quotes${query}`, conjuntoId);
}

export function createQuote(conjuntoId: string, data: CreateB2bQuoteInput) {
  return request<B2bQuote>("/conjunto/b2b/quotes", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Aceptar deja una alianza **pendiente de que el proveedor la confirme**; el
 * servicio no arranca en este clic. La UI tiene que decirlo o el administrador
 * creería que ya contrató.
 */
export function acceptQuote(conjuntoId: string, id: string) {
  return request<{ quote: B2bQuote; contract: { id: string } }>(
    `/conjunto/b2b/quotes/${id}/accept`,
    conjuntoId,
    { method: "PATCH" },
  );
}

export function rejectQuote(conjuntoId: string, id: string, reason: string) {
  return request<B2bQuote>(`/conjunto/b2b/quotes/${id}/reject`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function cancelQuote(conjuntoId: string, id: string, reason: string) {
  return request<B2bQuote>(`/conjunto/b2b/quotes/${id}/cancel`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
