"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getPayableConceptsService } from "../services/selfReportPaymentService";

/**
 * Conceptos de cobro del conjunto, vistos por el residente.
 *
 * `useFeePaymentsQuery` sirve para lo mismo pero pega contra un endpoint de
 * EMPLOYEE: al residente le devuelve 403 y la lista llegaba vacía, que es la
 * razón por la que en /my-vip no había forma de decir qué se estaba pagando.
 */
export function usePayableConceptsQuery(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: ["payable-concepts", conjuntoId],
    queryFn: () => getPayableConceptsService(conjuntoId),
    enabled: enabled && !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
