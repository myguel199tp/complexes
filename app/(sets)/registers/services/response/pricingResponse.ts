export interface PricingPlanDetail {
  total: number;
  perApartment: number;
  discountApplied?: number;
}

/**
 * Códigos que devuelve el backend cuando no puede cotizar. Vienen con
 * `plans: null`, por eso el consumidor siempre debe comprobar `plans` antes
 * de leerlo.
 */
export type PricingErrorCode =
  | "COUNTRY_DISABLED"
  | "MIN_APARTMENTS"
  | "MONTHLY_NOT_ALLOWED_UNDER_30";

export interface PricingResponse {
  plans: {
    basic: PricingPlanDetail;
    gold: PricingPlanDetail;
    platinum: PricingPlanDetail;
  } | null;
  error?: PricingErrorCode;
  currency: string;
  locale: string;
  billingPeriod: string;
}
