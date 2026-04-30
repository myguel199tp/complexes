"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractSummaryService } from "../services/myContractSummary";

export function useContractSummarytQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  //   const storedUserId = useConjuntoStore((state) => state.userId);

  const QUERY_PYMENT_CONTRACT = "query_pyemnt_contract";

  const query = useQuery({
    queryKey: [QUERY_PYMENT_CONTRACT],
    queryFn: () => getMyContractSummaryService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    // storedUserId,
    conjuntoId,
  };
}
