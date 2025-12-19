export interface PricingPlanDetail {
  total: number;
  perApartment: number;
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
