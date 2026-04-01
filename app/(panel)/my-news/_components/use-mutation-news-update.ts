import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataNewsServices } from "../services/newsSerives";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationUpdateNewsForm(id: string) {
  const api = new DataNewsServices();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: (formData: FormData) =>
      api.updateNews(conjuntoId, id, formData),
    retry: false,

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");

      queryClient.invalidateQueries({
        queryKey: ["QUERY_NEWS_PACKAGE"],
      });
    },

    onError: (error) => {
      const message = Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message || "Error inesperado";

      showAlert(message, "error");
    },
  });
}
