"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { selfReportPaymentService } from "../services/selfReportPaymentService";

interface SelfReportInput {
  /** Concepto tomado de la configuración de cobro del conjunto. */
  paymentConfigId?: string;
  /** Concepto suelto, para conjuntos que no tienen configuración creada. */
  type?: string;
  valuepay: string;
  /** Fecha en que se consignó, "yyyy-MM-dd". */
  paidAt?: string;
  description?: string;
  /** Referencia bancaria: reemplaza al comprobante cuando se pagó por convenio. */
  reference?: string;
  file?: File | null;
}

export function useSelfReportPaymentMutation(onDone?: () => void) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (input: SelfReportInput) => {
      if (!conjuntoId) {
        throw new Error(
          "No hay un conjunto seleccionado. Elige tu conjunto y vuelve a intentarlo.",
        );
      }

      const formData = new FormData();

      formData.append("valuepay", input.valuepay);

      if (input.file) formData.append("file", input.file);
      if (input.paymentConfigId)
        formData.append("paymentConfigId", input.paymentConfigId);
      if (input.type) formData.append("type", input.type);
      if (input.paidAt) formData.append("paidAt", input.paidAt);
      if (input.description) formData.append("description", input.description);
      if (input.reference) formData.append("reference", input.reference);

      return selfReportPaymentService(conjuntoId, formData);
    },

    onSuccess: () => {
      showAlert(
        "Pago reportado. Queda en revisión de la administración.",
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["my-fees"] });
      queryClient.invalidateQueries({ queryKey: ["my-fees-this-month"] });
      queryClient.invalidateQueries({ queryKey: ["my-fines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fee-pending"] });

      onDone?.();
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "No se pudo registrar el pago";

      showAlert(message, "error");
    },
  });
}
