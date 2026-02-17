import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataNewsServices } from "../services/newsSerives";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationNewsForm() {
  const router = useRouter();
  const api = new DataNewsServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (formData: FormData) => api.addNews(conjuntoId, formData),
    retry: false,

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.news);
    },

    onError: (error: any) => {
      const message = Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message || "Error inesperado";

      showAlert(message, "error");
    },
  });
}
