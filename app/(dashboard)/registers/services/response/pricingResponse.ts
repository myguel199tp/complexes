export interface PricingResponse {
  plans: {
    basic: number;
    gold: number;
    platinum: number;
  };
  perApartment: {
    basic: number;
    gold: number;
    platinum: number;
  };
  currency: string;
  locale: string;
}
