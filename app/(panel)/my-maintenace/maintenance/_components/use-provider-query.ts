// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataProviderServices } from "../../services/providerServices";

const api = new DataProviderServices();

export function useProviderQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO_PROVIDER = "query_info_provider";
  const query = useQuery({
    queryKey: [QUERY_INFO_PROVIDER, conjuntoId],
    queryFn: () => api.getProviders(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
