import { comercioFetch } from "../../_lib/comercio-api";

export interface ComercioBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood?: string;
  phone?: string;
  isActive: boolean;
}

export interface ComercioBranchInput {
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood?: string;
  phone?: string;
}

export function getBranches() {
  return comercioFetch<ComercioBranch[]>("/comercio/branches");
}

export function createBranch(data: ComercioBranchInput) {
  return comercioFetch<ComercioBranch>("/comercio/branches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBranch(id: string, data: Partial<ComercioBranchInput>) {
  return comercioFetch<ComercioBranch>(`/comercio/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateBranch(id: string) {
  return comercioFetch<ComercioBranch>(`/comercio/branches/${id}/deactivate`, {
    method: "PATCH",
  });
}

export function reactivateBranch(id: string) {
  return comercioFetch<ComercioBranch>(`/comercio/branches/${id}/reactivate`, {
    method: "PATCH",
  });
}
