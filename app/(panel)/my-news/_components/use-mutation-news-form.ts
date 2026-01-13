import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataNewsServices } from "../services/newsSerives";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationNewsForm() {
  const api = new DataNewsServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (formData: FormData) => api.addNews(formData),
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
