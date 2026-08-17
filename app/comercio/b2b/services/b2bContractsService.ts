import { comercioFetch } from "../../_lib/comercio-api";
import { B2bBillingPeriod, B2bPricingModel } from "./b2bPlansService";

export type B2bContractStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled"
  /** Servicio cortado por mora. La alianza sigue viva: al pagar vuelve a activa. */
  | "suspended";

export interface B2bContract {
  id: string;
  conjuntoId: string;
  conjunto?: { name: string; city?: string };
  planName: string;
  price: number;
  quantityapt?: number;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  status: B2bContractStatus;
  notes?: string;
  rejectionReason?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  nextPaymentDate?: string;
  createdAt: string;
}

export function getB2bContracts(status?: B2bContractStatus) {
  const query = status ? `?status=${status}` : "";
  return comercioFetch<B2bContract[]>(`/comercio/b2b/contracts${query}`);
}

export function confirmB2bContract(id: string) {
  return comercioFetch<B2bContract>(`/comercio/b2b/contracts/${id}/confirm`, {
    method: "PATCH",
  });
}

export function rejectB2bContract(id: string, reason?: string) {
  return comercioFetch<B2bContract>(`/comercio/b2b/contracts/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
