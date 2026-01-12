// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allPaymentService } from "../services/payInfoConjunto";

export function usePaymentQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_PAYMENT = "query_payment";
  const query = useQuery({
    queryKey: [QUERY_PAYMENT, conjuntoId],
    queryFn: () => allPaymentService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
