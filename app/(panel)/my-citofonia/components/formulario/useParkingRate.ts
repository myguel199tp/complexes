"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "@/app/(panel)/my-fees/services/feePaymentsService";

/**
 * Lee la tarifa por hora del parqueadero configurada en /my-fees/feesall
 * (cuota de tipo "Pago de parqueadero") para el conjunto activo.
 *
 * Es la única fuente de la tarifa: el vigilante no la escribe. Si la
 * administración no la configuró, `parkingRate` es null y la visita se
 * registra en 0.
 *
 * Usa `/parking-rate` y no la configuración completa porque esa está
 * restringida a EMPLOYEE y el portero recibía 403.
 */
export function useParkingRate() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery({
    queryKey: ["parking-rate", conjuntoId],
    queryFn: () => FeePaymentsService.getParkingRate(conjuntoId),
    enabled: !!conjuntoId,
  });

  return {
    parkingRate: query.data?.parkingRatePerHour ?? null,
    isLoading: query.isLoading,
  };
}
