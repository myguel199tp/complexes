import { comercioFetch } from "../../_lib/comercio-api";
import type { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";

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

export type B2bBillingPeriod = "mensual" | "semestral" | "anual";
export type B2bPricingModel = "fijo" | "por_apartamento";

/** Debe coincidir con los mínimos que valida el backend. */
export const QUOTE_SCOPE_MIN = 30;
export const QUOTE_CLOSING_REASON_MIN = 10;

/**
 * Los rótulos están escritos desde el lado del proveedor: para el conjunto
 * `requested` es "esperando al proveedor", pero para quien tiene que responder
 * es "pendiente de responder". Es el mismo estado leído desde la otra orilla.
 */
export const QUOTE_STATUS_LABELS: Record<B2bQuoteStatus, string> = {
  requested: "Pendiente de responder",
  visit_scheduled: "Visita agendada",
  quoted: "Cotizada, esperando decisión",
  accepted: "Aceptada",
  rejected: "No la tomaron",
  declined: "Declinada por ti",
  expired: "Vencida sin respuesta",
  cancelled: "Retirada por el conjunto",
};

export const QUOTE_STATUS_TONE: Record<B2bQuoteStatus, string> = {
  requested: "text-amber-300",
  visit_scheduled: "text-blue-300",
  quoted: "text-slate-300",
  accepted: "text-emerald-400",
  rejected: "text-slate-500",
  declined: "text-slate-500",
  expired: "text-amber-400",
  cancelled: "text-slate-500",
};

export interface B2bQuote {
  id: string;
  quoteNumber: string;
  status: B2bQuoteStatus;
  conjuntoId: string;
  conjuntoName: string | null;
  conjuntoCity: string | null;
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
  billingPeriod: B2bBillingPeriod | null;
  pricingModel: B2bPricingModel | null;
  scope: string | null;
  validUntil: string | null;
  respondedAt: string | null;
  contractId: string | null;
  closingReason: string | null;
  createdAt: string;
}

export interface RespondQuoteInput {
  price: number;
  currency?: string;
  kind: B2bQuoteKind;
  billingPeriod?: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  scope: string;
  validUntil: string;
}

export function getQuotes(status?: B2bQuoteStatus) {
  const query = status ? `?status=${status}` : "";
  return comercioFetch<B2bQuote[]>(`/comercio/b2b/quotes${query}`);
}

export function scheduleQuoteVisit(
  id: string,
  data: { visitScheduledAt: string; visitNotes?: string },
) {
  return comercioFetch<B2bQuote>(`/comercio/b2b/quotes/${id}/visit`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function respondQuote(id: string, data: RespondQuoteInput) {
  return comercioFetch<B2bQuote>(`/comercio/b2b/quotes/${id}/respond`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function declineQuote(id: string, reason: string) {
  return comercioFetch<B2bQuote>(`/comercio/b2b/quotes/${id}/decline`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
