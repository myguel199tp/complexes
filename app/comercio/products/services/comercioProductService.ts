import { comercioFetch } from "../../_lib/comercio-api";

export interface ComercioCategory {
  id: string;
  name: string;
}

export interface ComercioProduct {
  id: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId?: string;
  category?: ComercioCategory;
  isAvailable: boolean;
  images?: string[];
}

export interface ComercioProductInput {
  branchId: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId?: string;
}

export function getProducts() {
  return comercioFetch<ComercioProduct[]>("/comercio/products");
}

export function createProduct(data: ComercioProductInput, images?: File[]) {
  const formData = new FormData();
  formData.append("branchId", data.branchId);
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  if (data.stock !== undefined) formData.append("stock", String(data.stock));
  if (data.categoryId) formData.append("categoryId", data.categoryId);
  images?.forEach((file) => formData.append("images", file));

  return comercioFetch<ComercioProduct>("/comercio/products", {
    method: "POST",
    body: formData,
  });
}

export function updateProduct(id: string, data: Partial<ComercioProductInput>) {
  return comercioFetch<ComercioProduct>(`/comercio/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function setProductAvailability(id: string, isAvailable: boolean) {
  return comercioFetch<ComercioProduct>(`/comercio/products/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ isAvailable }),
  });
}

export function deleteProduct(id: string) {
  return comercioFetch<void>(`/comercio/products/${id}`, {
    method: "DELETE",
  });
}

export function getCategories() {
  return comercioFetch<ComercioCategory[]>("/comercio/categories");
}

export function createCategory(name: string) {
  return comercioFetch<ComercioCategory>("/comercio/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
