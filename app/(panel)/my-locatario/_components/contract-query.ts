"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractService } from "../services/myContractService";

export function useContractQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_CONTRACT = "query_contract";

  const query = useQuery({
    queryKey: [QUERY_CONTRACT, conjuntoId],
    queryFn: () => getMyContractService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
