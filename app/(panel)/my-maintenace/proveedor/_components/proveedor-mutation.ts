import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataProviderServices } from "../../services/providerServices";
import { ProviderResponse } from "../../services/response/providerResponse";
import { CreateProviderRequest } from "../../services/request/createproviderRequest";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const api = new DataProviderServices();

export function useProviderMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<ProviderResponse, Error, CreateProviderRequest>({
    mutationFn: (data) => api.addProvider(conjuntoId, data),

    onSuccess: () => {
      showAlert("¡Operacion exitosa!", "success");

      queryClient.invalidateQueries({
        queryKey: ["query-providers"],
      });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
