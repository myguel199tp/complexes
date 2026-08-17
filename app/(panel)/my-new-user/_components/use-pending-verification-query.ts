"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { VerificationService } from "../services/verificationService";

/**
 * Clave de caché de la bandeja de verificación.
 *
 * `modal-info.tsx` y `use-upload-payment-mutation.ts` ya la invalidaban al
 * aprobar, rechazar o subir un comprobante, pero no había ninguna query
 * registrada bajo ella: la invalidación no refrescaba nada porque la pantalla
 * no existía.
 */
export const PENDING_VERIFICATION_KEY = "admin-fee-pending";

export function usePendingVerificationQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [PENDING_VERIFICATION_KEY, conjuntoId],
    queryFn: () => VerificationService.getPendingVerification(conjuntoId),
    enabled: !!conjuntoId,
  });
}
