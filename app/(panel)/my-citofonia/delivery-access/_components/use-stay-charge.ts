"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  getStayCharge,
  getStayQrBlob,
  payStayCash,
  startStayCheckout,
  waiveStayCharge,
  type StayCharge,
} from "../../services/stayChargeService";

/** PAID, REVIEW y FREE dejan entrar; solo PENDING retiene al huésped. */
export const isChargeSettled = (charge?: StayCharge | null) =>
  !!charge && charge.status !== "PENDING";

/**
 * Estado del cobro, en bucle mientras el modal está abierto.
 *
 * Es lo que le avisa al celador que el huésped ya pagó en su celular sin que él
 * tenga que preguntar ni tocar nada: la pantalla cambia sola y ahí abre la reja.
 */
export function useStayCharge(externalStayId?: string, enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery<StayCharge>({
    queryKey: ["stay-charge", externalStayId, conjuntoId],
    queryFn: () => getStayCharge(conjuntoId, String(externalStayId)),
    enabled: !!externalStayId && !!conjuntoId && enabled,
    /**
     * Se consulta cada 4s mientras el modal está abierto. No se apaga solo al
     * quedar saldado porque el modal se cierra en ese momento y `enabled` pasa a
     * false: apagarlo también aquí dependería de la forma del callback, que
     * cambió entre versiones de react-query.
     */
    refetchInterval: 4000,
  });
}

export function useStartStayCheckout() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<StayCharge, Error, string>({
    mutationFn: (externalStayId) =>
      startStayCheckout(conjuntoId, externalStayId),
  });
}

export function usePayStayCash() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<StayCharge, Error, { stayId: string; file: File }>({
    mutationFn: ({ stayId, file }) => payStayCash(conjuntoId, stayId, file),
  });
}

export function useWaiveStayCharge() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<StayCharge, Error, { stayId: string; reason: string }>({
    mutationFn: ({ stayId, reason }) =>
      waiveStayCharge(conjuntoId, stayId, reason),
  });
}

/**
 * Baja el PNG del QR y lo expone como object URL.
 *
 * Solo corre cuando el celador pidió ver el QR: pedirlo también abre el cobro
 * en el backend, y hacerlo al montar el modal emitiría un token cada vez que
 * alguien mira la pantalla.
 */
export function useStayQr(externalStayId: string | undefined, enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !externalStayId || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const blob = await getStayQrBlob(conjuntoId, externalStayId);

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
  }, [externalStayId, conjuntoId, enabled]);

  return url;
}
