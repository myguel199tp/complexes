import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataExternalServices } from "../services/externalService";
import { ExternalResponse } from "../services/response/externalResponse";
import { ExternalRequest } from "../services/request/externaRequest";

const api = new DataExternalServices();

export function useExternalMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ExternalResponse, Error, ExternalRequest>({
    mutationFn: (data) => api.addExternal(data),

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      queryClient.invalidateQueries({ queryKey: ["common-areas"] });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
