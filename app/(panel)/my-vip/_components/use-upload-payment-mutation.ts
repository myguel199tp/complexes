"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { uploadFeePaymentService } from "../services/uploadFeePaymentService";

interface UploadPaymentInput {
  feeId: string;
  /**
   * Opcional desde que el backend acepta la referencia: quien paga por convenio
   * de recaudo no tiene comprobante que adjuntar, solo el número de la
   * transacción.
   */
  file?: File | null;
  valuepay?: string;
  reference?: string;
}

export function useUploadFeePaymentMutation(onDone?: () => void) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async ({
      feeId,
      file,
      valuepay,
      reference,
    }: UploadPaymentInput) => {
      /**
       * Sin conjunto el header viajaba vacío y el guard respondía 403 "Debes
       * seleccionar un conjunto", que llegaba al residente como una palabra
       * suelta. Se corta antes, con el motivo real.
       */
      if (!conjuntoId) {
        throw new Error(
          "No hay un conjunto seleccionado. Elige tu conjunto y vuelve a intentarlo.",
        );
      }

      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      }

      if (valuepay) {
        formData.append("valuepay", valuepay);
      }

      if (reference) {
        formData.append("reference", reference);
      }

      return uploadFeePaymentService(feeId, conjuntoId, formData);
    },

    onSuccess: () => {
      showAlert(
        "Comprobante enviado. Queda en revisión de la administración.",
        "success",
      );

      // La cuota cambia de estado, así que todas las vistas que la muestran
      // quedan desactualizadas.
      queryClient.invalidateQueries({ queryKey: ["my-fees"] });
      queryClient.invalidateQueries({ queryKey: ["my-fees-this-month"] });
      queryClient.invalidateQueries({ queryKey: ["my-fines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fee-pending"] });

      onDone?.();
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir el comprobante";

      showAlert(message, "error");
    },
  });
}
