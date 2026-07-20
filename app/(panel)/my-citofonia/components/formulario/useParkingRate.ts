"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "@/app/(panel)/my-fees/services/feePaymentsService";
import { FeeType } from "@/app/(panel)/my-fees/services/admin-fee-payment";

/**
 * Lee la tarifa por hora del parqueadero configurada en /my-fees/feesall
 * (cuota de tipo "Pago de parqueadero") para el conjunto activo.
 *
 * Citofonía usa este valor para autollenar el campo "Valor por hora" de cada
 * visita, en vez de que el vigilante lo escriba manualmente.
 */
export function useParkingRate() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery({
    queryKey: ["parking-rate", conjuntoId],
    queryFn: () => FeePaymentsService.getPayments(conjuntoId),
    enabled: !!conjuntoId,
  });

  // Se toma la config más reciente de tipo parqueadero con tarifa definida.
  const parkingRate =
    query.data
      ?.filter(
        (cfg) =>
          cfg.feeType === FeeType.PAGO_DE_PARQUEADERO &&
          cfg.parkingRatePerHour != null,
      )
      .map((cfg) => cfg.parkingRatePerHour as number)[0] ?? null;

  return {
    parkingRate,
    isLoading: query.isLoading,
  };
}
