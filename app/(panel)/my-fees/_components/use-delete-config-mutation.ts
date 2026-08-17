import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../services/feePaymentsService";

/**
 * Elimina una configuración de cobro.
 *
 * Existe sobre todo para limpiar los duplicados que dejó el flujo anterior,
 * donde cada "Guardar configuración" insertaba una fila nueva porque no había
 * ni PATCH ni DELETE en el backend.
 */
export function useDeleteConfigMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (id: string) =>
      FeePaymentsService.deletePayment(id, conjuntoId),

    onSuccess: () => {
      showAlert("Configuración eliminada", "success");
      queryClient.invalidateQueries({ queryKey: ["fee_payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fee-payments"] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "Error al eliminar", "error");
    },
  });
}
