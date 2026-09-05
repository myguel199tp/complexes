"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractRentService } from "../services/contracTenantService";

export function useContractRentQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_CONTRACT_RENT = "query_contract_rent";

  const query = useQuery({
    // El conjunto va en la key porque el queryFn lo usa: sin él, cambiar de
    // conjunto devolvía el contrato del anterior desde caché.
    queryKey: [QUERY_CONTRACT_RENT, conjuntoId],
    queryFn: () => getMyContractRentService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
