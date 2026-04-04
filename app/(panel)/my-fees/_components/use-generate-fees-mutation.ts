import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../services/feePaymentsService";

export function useGenerateFeesMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<{ message: string; generatedFees: number }, Error, string>(
    {
      mutationFn: (configId: string) =>
        FeePaymentsService.generateFees(configId, conjuntoId),

      onSuccess: (data) => {
        showAlert(
          `Se generaron ${data.generatedFees} cuotas correctamente`,
          "success",
        );

        queryClient.invalidateQueries({
          queryKey: ["admin-fee-payments"],
        });
      },

      onError: (error) => {
        showAlert(error.message || "Error al generar cuotas", "error");
      },
    },
  );
}
