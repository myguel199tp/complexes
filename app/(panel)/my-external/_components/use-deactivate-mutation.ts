import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExternalServices } from "../services/externalService";

const api = new DataExternalServices();

export function useDeactivateExternalMutation(hollidayId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation<unknown, Error, string>({
    mutationFn: (id) => api.deactivateExternal(id, String(conjuntoId)),
    onSuccess: () => {
      showAlert("Integración desconectada", "success");
      queryClient.invalidateQueries({
        queryKey: ["external-listings", hollidayId],
      });
    },
    onError: (error) => {
      showAlert(error.message || "Error al desconectar", "error");
    },
  });
}
