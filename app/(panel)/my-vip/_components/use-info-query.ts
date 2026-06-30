"use client";

import { useQuery } from "@tanstack/react-query";
import { allUserVipService } from "../services/myVipInfoService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useInfoQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO = "query_info";
  const query = useQuery({
    queryKey: [QUERY_INFO, conjuntoId],
    queryFn: () => allUserVipService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    conjuntoId,
  };
}
