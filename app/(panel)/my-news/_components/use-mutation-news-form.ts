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
    retry: false,

    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        router.push(route.news);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert(
        "Verifica que tu cuenta esté activa y que tengas los permisos necesarios, o intenta nuevamente más tarde si el problema persiste.",
        "error"
      );
    },
  });
}
