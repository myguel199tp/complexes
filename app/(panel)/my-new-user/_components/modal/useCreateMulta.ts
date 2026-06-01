import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { userMultaService } from "../../services/userMultaService";
import { MultaRequest } from "../../services/request/multaRequest";
import { MultaResponse } from "../../services/response/multaResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useResidentFineMutation() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<MultaResponse, Error, MultaRequest>({
    mutationFn: (data) => userMultaService(conjuntoId, data),

    onSuccess: () => {
      showAlert("¡Multa creada exitosamente!", "success");

      queryClient.invalidateQueries({
        queryKey: ["query-resident-fines"],
      });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
