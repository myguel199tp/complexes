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
  latitude?: number | null;
  longitude?: number | null;
  /**
   * "pin": puesta en el mapa. "street" / "neighborhood": sacada de la
   * dirección, aproximada. `null`: todavía sin ubicar.
   */
  locationSource?: "pin" | "street" | "neighborhood" | null;
}

export interface ComercioBranchInput {
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood?: string;
  phone?: string;
  /** Pin del mapa; van juntas o ninguna. */
  latitude?: number;
  longitude?: number;
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
