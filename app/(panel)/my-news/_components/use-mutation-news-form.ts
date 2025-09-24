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
      // Aquí solo llamamos el servicio
      return api.addNews(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        // 👇 aseguramos que navegue después del alert
        setTimeout(() => {
          router.push(route.news);
        }, 100);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
