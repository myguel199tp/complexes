import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../services/feePaymentsService";

import {
  AdminFeePayment,
  CreateAdminFeePaymentDto,
} from "../services/admin-fee-payment";

export function useAdminFeePaymentMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<AdminFeePayment, Error, CreateAdminFeePaymentDto>({
    mutationFn: (data) => FeePaymentsService.createPayment(data, conjuntoId),

    onSuccess: () => {
      showAlert("¡Configuración guardada correctamente!", "success");

      queryClient.invalidateQueries({
        queryKey: ["admin-fee-payments"],
      });
    },

    onError: (error) => {
      showAlert(error.message || "Error al guardar", "error");
    },
  });
}
