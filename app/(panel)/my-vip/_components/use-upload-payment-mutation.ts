"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { uploadFeePaymentService } from "../services/uploadFeePaymentService";

interface UploadPaymentInput {
  feeId: string;
  file: File;
  valuepay?: string;
}

export function useUploadFeePaymentMutation(onDone?: () => void) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async ({ feeId, file, valuepay }: UploadPaymentInput) => {
      const formData = new FormData();
      formData.append("file", file);

      if (valuepay) {
        formData.append("valuepay", valuepay);
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
