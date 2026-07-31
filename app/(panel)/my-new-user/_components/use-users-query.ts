"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allUserService, UsersQueryFilters } from "../services/usersService";

export function useUsersQuery(
  page: number,
  limit: number = 10,
  filters: UsersQueryFilters = {},
) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_USER_REGISTER = "query_user_register";

  const appliedFilters: UsersQueryFilters = {
    search: filters.search?.trim() ?? "",
    debt: filters.debt ?? "",
    status: filters.status ?? "",
  };

  const query = useQuery({
    queryKey: [QUERY_USER_REGISTER, conjuntoId, page, limit, appliedFilters],
    queryFn: () => allUserService(conjuntoId, page, limit, appliedFilters),
    enabled: !!conjuntoId,
    keepPreviousData: true,
  });

  return {
    ...query,
    conjuntoId,
  };
}
