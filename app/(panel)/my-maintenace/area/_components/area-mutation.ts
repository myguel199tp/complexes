import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataCommmonAreaServices } from "../../services/commonAreaServices";
import { CreateCommonAreaRequest } from "../../services/request/createCommonAreaRequest";
import { CommonAreaResponse } from "../../services/response/commonAreaResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const api = new DataCommmonAreaServices();

export function useCommonAreaMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<CommonAreaResponse, Error, CreateCommonAreaRequest>({
    mutationFn: (data) => api.addCommmonArea(conjuntoId, data),

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      queryClient.invalidateQueries({ queryKey: ["common-areas"] });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
