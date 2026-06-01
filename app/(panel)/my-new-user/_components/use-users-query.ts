"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allUserService } from "../services/usersService";

export function useUsersQuery(page: number, limit: number = 10) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_USER_REGISTER = "query_user_register";

  const query = useQuery({
    queryKey: [QUERY_USER_REGISTER, conjuntoId, page, limit],
    queryFn: () => allUserService(conjuntoId, page, limit),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
