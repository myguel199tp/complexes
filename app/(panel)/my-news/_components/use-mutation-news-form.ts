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
    mutationFn: async (formData: FormData) => {
      const response = await api.addNews(formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.news);
      } else {
        showAlert("¡Algo salio mal intenta nuevamente!", "error");
      }
    },
  });
}
