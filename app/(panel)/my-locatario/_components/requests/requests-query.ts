"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  getContractRequestService,
  getContractRequestsService,
  ContractRequestFilters,
} from "../../services/contractRequestService";

export const QUERY_CONTRACT_REQUESTS = "query_contract_requests";
export const QUERY_CONTRACT_REQUEST = "query_contract_request";

export function useContractRequestsQuery(filters: ContractRequestFilters = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    // Los filtros van en la key: sin eso, cambiar de estado devolvía la lista
    // anterior desde caché hasta que terminara el refetch.
    queryKey: [
      QUERY_CONTRACT_REQUESTS,
      conjuntoId,
      filters.status ?? null,
      filters.type ?? null,
    ],
    queryFn: () => getContractRequestsService(String(conjuntoId), filters),
    enabled: !!conjuntoId,
  });

  return { ...query, conjuntoId };
}

export function useContractRequestQuery(requestId?: number) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: [QUERY_CONTRACT_REQUEST, conjuntoId, requestId],
    queryFn: () => getContractRequestService(String(conjuntoId), requestId!),
    enabled: !!conjuntoId && !!requestId,
  });

  return { ...query, conjuntoId };
}
