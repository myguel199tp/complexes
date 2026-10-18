import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface UsersPaginationResponse {
  data: EnsembleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DebtFilter = "" | "con" | "sin";

export type FeeStatusFilter =
  | ""
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "NOTIFIED";

export type ResidenceFilter = "" | "si" | "no";

export interface UsersQueryFilters {
  search?: string;
  debt?: DebtFilter;
  status?: FeeStatusFilter;
  /** Solo estos roles: cada pestaña (propietarios, arrendatarios…) pide los suyos */
  roles?: string[];
  residence?: ResidenceFilter;
}

export async function allUserService(
  conjuntoId: string,
  page: number = 1,
  limit: number = 10,
  filters: UsersQueryFilters = {},
): Promise<UsersPaginationResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const search = filters.search?.trim();

  if (search) params.set("search", search);
  if (filters.debt) params.set("debt", filters.debt);
  if (filters.status) params.set("status", filters.status);
  if (filters.roles?.length) params.set("roles", filters.roles.join(","));
  if (filters.residence) params.set("residence", filters.residence);

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/conjunto?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  return await response.json();
}
