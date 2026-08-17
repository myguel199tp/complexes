import { comercioFetch } from "../../_lib/comercio-api";
import { B2bBillingPeriod } from "./b2bPlansService";

export type B2bInvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface B2bInvoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  planName: string;
  conjuntoId: string;
  conjuntoName?: string | null;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  status: B2bInvoiceStatus;
  paidAt?: string | null;
  paymentReference?: string | null;
  createdAt: string;
}

/** Debe coincidir con SUSPEND_REASON_MIN del backend. */
export const SUSPEND_REASON_MIN = 20;

export function getB2bInvoices(filters: {
  status?: B2bInvoiceStatus;
  contractId?: string;
} = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.contractId) params.set("contractId", filters.contractId);

  const query = params.toString();
  return comercioFetch<B2bInvoice[]>(
    `/comercio/b2b/invoices${query ? `?${query}` : ""}`,
  );
}

/**
 * Registra el pago de una factura. Lo hace el comercio porque el dinero va del
 * conjunto a él directamente: la plataforma no ve esa transacción, solo la
 * anota.
 */
export function payB2bInvoice(
  id: string,
  data: { paymentReference?: string; paidAt?: string } = {},
) {
  return comercioFetch<B2bInvoice>(`/comercio/b2b/invoices/${id}/pay`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Suspende el servicio por mora. El backend exige al menos una factura vencida
 * y un motivo de mínimo 20 caracteres, que le llega al conjunto por correo.
 */
export function suspendB2bContract(contractId: string, reason: string) {
  return comercioFetch<{ id: string; status: string }>(
    `/comercio/b2b/contracts/${contractId}/suspend`,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}
