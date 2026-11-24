import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  importInitialBalancesService,
  InitialBalanceImportRequest,
  InitialBalanceImportSummary,
} from "../services/initialBalanceImportService";

export function useInitialBalanceImportMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<
    InitialBalanceImportSummary,
    Error,
    InitialBalanceImportRequest
  >({
    mutationFn: (dto) => importInitialBalancesService(dto, conjuntoId),
    onSuccess: (data) => {
      // El saldo se ve en la tabla de cuotas, en la cartera y en la ficha de
      // cada unidad (donde habilita asignarle otras cuotas).
      queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fee-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["unit-statement"] });

      showAlert(
        `Saldos iniciales: ${data.created} cargados, ${data.skipped} omitidos, ${data.failed} con error`,
        data.failed > 0 ? "error" : "success",
      );
    },
    onError: (error) => {
      showAlert(
        error.message || "No se pudieron cargar los saldos iniciales",
        "error",
      );
    },
  });
}
