"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyTenantService } from "../services/optMySubuserservices";

export function useTenantQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = useConjuntoStore((state) => state.userId);

  const QUERY_TENANT = "query_tenant";

  const query = useQuery({
    queryKey: [QUERY_TENANT, storedUserId, conjuntoId],
    queryFn: () => getMyTenantService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    storedUserId,
    conjuntoId,
  };
}
