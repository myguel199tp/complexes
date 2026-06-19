import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataExternalServices } from "../services/externalService";

const api = new DataExternalServices();

export function useDeactivateExternalMutation(hollidayId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<unknown, Error, string>({
    mutationFn: (id) => api.deactivateExternal(id),
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
