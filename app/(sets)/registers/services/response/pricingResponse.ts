export interface PricingPlanDetail {
  total: number;
  perApartment: number;
  discountApplied?: number;
}

export interface PricingResponse {
  plans: {
    basic: PricingPlanDetail;
    gold: PricingPlanDetail;
    platinum: PricingPlanDetail;
  };
  currency: string;
  locale: string;
  billingPeriod: string;
}
