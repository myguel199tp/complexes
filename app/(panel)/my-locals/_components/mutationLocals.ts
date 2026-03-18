import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataLocalsServices } from "../services/localsServices";
import { CreateLocalResponse } from "../services/response/localsResponse";
import { CreateLocalRequest } from "../services/request/localsRequest";

const api = new DataLocalsServices();
export function useMutationLocals() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<CreateLocalResponse, Error, CreateLocalRequest>({
    mutationFn: (data) => api.addLoals(data),

    onSuccess: () => {
      showAlert("¡Operacion exitosa!", "success");

      queryClient.invalidateQueries({
        queryKey: ["query-locals"],
      });


    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
