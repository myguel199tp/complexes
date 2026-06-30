import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioBillingPeriod = "mensual" | "semestral" | "anual";

export interface ComercioPlanOption {
  id: string;
  label: string;
  price: number;
  currency: string;
}

export const COMERCIO_PLANS: ComercioPlanOption[] = [
  { id: "basico", label: "Básico", price: 1200, currency: "USD" },
  { id: "pro", label: "Pro", price: 2400, currency: "USD" },
  { id: "premium", label: "Premium", price: 4800, currency: "USD" },
];

export interface ComercioPaymentInfo {
  id: string;
  businessName: string;
  address: string;
  city: string;
  country: string;
  plan: string;
  prices: number;
  currency: string;
}

export interface ComercioPaymentStatus {
  id: string;
  businessName: string;
  plan: string;
  prices: number;
  currency: string;
  country: string;
  city: string;
  address: string;
  billingPeriod: ComercioBillingPeriod;
  planActive: boolean;
  nextPaymentDate: string | null;
  daysRemaining: number;
  isExpiringSoon: boolean;
  lastPaymentDate: string | null;
}

export interface SimulateComercioPaymentPayload {
  plan: string;
  amount: number;
  currency: string;
  billingPeriod: "anual";
}

export interface SimulateComercioPaymentResponse {
  message: string;
  invoiceNumber: string;
  planActive: boolean;
}

export function getComercioPaymentInfo() {
  return comercioFetch<ComercioPaymentInfo>("/comercio/payment/payment-info");
}

export function getComercioPaymentStatus() {
  return comercioFetch<ComercioPaymentStatus>(
    "/comercio/payment/payment-status",
  );
}

export function simulateComercioPayment(
  data: SimulateComercioPaymentPayload,
) {
  return comercioFetch<SimulateComercioPaymentResponse>(
    "/comercio/payment/simulate-payment",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}
