"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../services/feePaymentsService";

/**
 * Estado de los coeficientes de copropiedad del conjunto.
 *
 * Se consulta antes de generar para que el descuadre se vea al entrar y no al
 * cerrar el mes: si los coeficientes no suman 100%, lo recaudado nunca va a
 * coincidir con el presupuesto aprobado en asamblea.
 */
export function useCoefficientsQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: ["coefficients-check", conjuntoId],
    queryFn: () => FeePaymentsService.getCoefficientsCheck(conjuntoId),
    enabled: !!conjuntoId,
  });
}
