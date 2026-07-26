import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataServiceCatalogService } from "../../services/addServiceCatalog";
import { QUERY_MY_ADD } from "../use-myadd-query";

const api = new DataServiceCatalogService();

export function useMutationServiceForm() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: (formData: FormData) => api.create(conjuntoId, formData),

    onSuccess: () => {
      // No navegamos: publicar servicios se hace de a varios seguidos.
      queryClient.invalidateQueries({
        queryKey: [QUERY_MY_ADD, conjuntoId],
      });
      showAlert("¡Servicio publicado!", "success");
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
