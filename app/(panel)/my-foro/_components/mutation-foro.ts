import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataForoServices } from "../services/myForoServices";
import { ForumPayload } from "./cosntants";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationForo() {
  const api = new DataForoServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: ForumPayload) => {
      return api.addForo(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        router.push(route.foro);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
