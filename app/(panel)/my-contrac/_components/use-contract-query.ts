"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractRentService } from "../services/contracTenantService";

export function useContractRentQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_CONTRACT_RENT = "query_contract_rent";

  const query = useQuery({
    queryKey: [QUERY_CONTRACT_RENT],
    queryFn: () => getMyContractRentService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    // storedUserId,
    conjuntoId,
  };
}
