import { comercioFetch } from "../../_lib/comercio-api";

export type B2bBillingPeriod = "mensual" | "semestral" | "anual";
export type B2bPricingModel = "fijo" | "por_apartamento";

export interface B2bPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  isActive: boolean;
  createdAt: string;
}

export interface B2bPlanInput {
  name: string;
  description: string;
  price: number;
  currency?: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  isActive?: boolean;
}

export function getB2bPlans() {
  return comercioFetch<B2bPlan[]>("/comercio/b2b/plans");
}

export function createB2bPlan(data: B2bPlanInput) {
  return comercioFetch<B2bPlan>("/comercio/b2b/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateB2bPlan(id: string, data: Partial<B2bPlanInput>) {
  return comercioFetch<B2bPlan>(`/comercio/b2b/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteB2bPlan(id: string) {
  return comercioFetch<{ success: boolean }>(`/comercio/b2b/plans/${id}`, {
    method: "DELETE",
  });
}
