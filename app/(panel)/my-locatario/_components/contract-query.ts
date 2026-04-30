"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractService } from "../services/myContractService";

export function useContractQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  //   const storedUserId = useConjuntoStore((state) => state.userId);

  const QUERY_CONTRACT = "query_contract";

  const query = useQuery({
    queryKey: [QUERY_CONTRACT],
    queryFn: () => getMyContractService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    // storedUserId,
    conjuntoId,
  };
}
