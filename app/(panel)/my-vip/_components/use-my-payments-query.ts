"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyPayments } from "../services/myPaymentsService";

/** Los pagos verificados del residente, con sus recibos. */
export function useMyPaymentsQuery(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["my-payments", conjuntoId],
    queryFn: () => getMyPayments(String(conjuntoId)),
    enabled: enabled && !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
