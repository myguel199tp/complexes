import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioBillingPeriod = "mensual" | "semestral" | "anual";

export interface ConjuntoPricing {
  billingPeriod: ComercioBillingPeriod;
  price: number;
  currency: string;
}

export interface NearbyConjunto {
  id: string;
  name: string;
  address: string;
  city: string;
  /** Nombre de la ciudad; `city` es el id del selector. */
  cityName?: string;
  /** Kilómetros entre la sucursal y el conjunto, con un decimal. */
  distanceKm?: number;
  /**
   * "exact": los dos tienen pin. "approx": alguno salió de la dirección.
   * "city": se midió entre centros de ciudad y no distingue conjuntos de la
   * misma ciudad.
   */
  distancePrecision?: "exact" | "approx" | "city";
  neighborhood?: string | null;
  quantityapt: number | null;
  currency: string;
  pricing: ConjuntoPricing[];
  alreadySubscribed: boolean;
  subscriptionActive: boolean;
  nextPaymentDate: string | null;
}

export interface ConjuntoSubscription {
  id: string;
  conjuntoId: string;
  conjuntoName?: string;
  city?: string;
  cityName?: string;
  neighborhood?: string;
  quantityapt: number | null;
  billingPeriod: ComercioBillingPeriod;
  prices: number;
  currency: string;
  lastPaymentDate?: string;
  nextPaymentDate: string | null;
  isActive: boolean;
}

export interface SubscribeItem {
  conjuntoId: string;
  branchId: string;
  billingPeriod: ComercioBillingPeriod;
}

export interface SubscribeResult {
  message: string;
  count: number;
  total: number;
  currency: string;
  subscriptions: {
    id: string;
    conjuntoId: string;
    billingPeriod: ComercioBillingPeriod;
    prices: number;
    nextPaymentDate: string | null;
  }[];
}

export function getNearbyConjuntos(branchId: string) {
  return comercioFetch<NearbyConjunto[]>(
    `/comercio/conjunto-subscriptions/nearby/${branchId}`,
  );
}

export function getMySubscriptions() {
  return comercioFetch<ConjuntoSubscription[]>(
    "/comercio/conjunto-subscriptions/mine",
  );
}

export function subscribeToConjuntos(items: SubscribeItem[]) {
  return comercioFetch<SubscribeResult>("/comercio/conjunto-subscriptions", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
