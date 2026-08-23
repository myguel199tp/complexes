"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ParkingChargeService,
  type ParkingCheckout,
} from "../../services/parkingChargeService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const service = new ParkingChargeService();

/** Liquida la cuenta y abre el cobro que el visitante escanea. */
export function useStartCheckout() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<ParkingCheckout, Error, string>({
    mutationFn: (visitId: string) => service.startCheckout(conjuntoId, visitId),
  });
}

/**
 * Baja el PNG del QR y lo expone como object URL.
 *
 * Solo corre cuando ya hay un cobro abierto: pedir el QR también liquida la
 * cuenta en el backend, y hacerlo al abrir el modal congelaría el monto de
 * visitas que el celador solo estaba mirando.
 */
export function useParkingQr(visitId: string | undefined, enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !visitId || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const blob = await service.getQrBlob(conjuntoId, visitId);

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      // Sin esto el blob queda retenido mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visitId, conjuntoId, enabled]);

  return url;
}

/** Efectivo al celador. El soporte viaja en el mismo request. */
export function usePayCashMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { visitId: string; file: File }>({
    mutationFn: ({ visitId, file }) =>
      service.payCash(conjuntoId, visitId, file),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
}
