import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataNewsServices } from "../services/newsSerives";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CONTENT_QUOTA_KEY } from "@/app/components/content-quota/use-content-quota";

export function useMutationNewsForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const api = new DataNewsServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: (formData: FormData) => api.addNews(conjuntoId, formData),
    retry: false,

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");

      // La noticia gastó cupo: el contador del formulario tiene que bajar.
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUOTA_KEY, "news"] });

      router.push(route.mynews);
    },

    onError: (error) => {
      // Si fue por el cupo, otra pestaña pudo gastarlo: se vuelve a pedir.
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUOTA_KEY, "news"] });

      const message = Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message || "Error inesperado";

      showAlert(message, "error");
    },
  });
}
