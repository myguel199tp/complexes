"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getOnlinePaymentStatus } from "../services/onlinePaymentService";

/**
 * Si el propietario puede pagar en línea. Solo se consulta para `owner`: al
 * resto el botón no se le muestra y la pregunta sobra.
 */
export function useOnlinePaymentStatusQuery(enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["online-payment-status", conjuntoId],
    queryFn: () => getOnlinePaymentStatus(String(conjuntoId)),
    enabled: enabled && !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
