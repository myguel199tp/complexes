"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractSummaryService } from "../services/myContractSummary";

export function useContractSummarytQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_CONTRACT_SUMMARY = "query_contract_summary";

  const query = useQuery({
    queryKey: [QUERY_CONTRACT_SUMMARY, conjuntoId],
    queryFn: () => getMyContractSummaryService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
