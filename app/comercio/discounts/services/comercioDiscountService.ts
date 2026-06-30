import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioDiscountType = "PERCENTAGE" | "FIXED";
export type ComercioDiscountScope = "ORDER" | "CATEGORY" | "ITEM";

export interface ComercioDiscount {
  id: string;
  branchId: string;
  name: string;
  discountType: ComercioDiscountType;
  value: number;
  scope: ComercioDiscountScope;
  categoryId?: string;
  productIds?: string[];
  serviceIds?: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface ComercioDiscountInput {
  branchId: string;
  name: string;
  discountType: ComercioDiscountType;
  value: number;
  scope: ComercioDiscountScope;
  categoryId?: string;
  productIds?: string[];
  serviceIds?: string[];
  startDate?: string;
  endDate?: string;
}

export function getDiscounts() {
  return comercioFetch<ComercioDiscount[]>("/comercio/discounts");
}

export function createDiscount(data: ComercioDiscountInput) {
  return comercioFetch<ComercioDiscount>("/comercio/discounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDiscount(
  id: string,
  data: Partial<ComercioDiscountInput>,
) {
  return comercioFetch<ComercioDiscount>(`/comercio/discounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateDiscount(id: string) {
  return comercioFetch<ComercioDiscount>(
    `/comercio/discounts/${id}/deactivate`,
    { method: "PATCH" },
  );
}

export function reactivateDiscount(id: string) {
  return comercioFetch<ComercioDiscount>(
    `/comercio/discounts/${id}/reactivate`,
    { method: "PATCH" },
  );
}
