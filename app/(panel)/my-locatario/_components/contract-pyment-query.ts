"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyContractPymentService } from "../services/myContractPaymentService";

export function useContractPymentQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_PYMENT_CONTRACT = "query_pyemnt_contract";

  const query = useQuery({
    queryKey: [QUERY_PYMENT_CONTRACT, conjuntoId], // 🔥 importante
    queryFn: () => getMyContractPymentService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
