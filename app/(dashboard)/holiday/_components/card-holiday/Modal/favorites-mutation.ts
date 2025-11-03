import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { FavoriteServices } from "../../../services/favoriteService";
import { ICreateFavorite } from "../../../services/response/favoriteResponse";

export function useMutationFavorites() {
  const api = new FavoriteServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (data: ICreateFavorite) => {
      const response = await api.favoriteServices(data);

      // ⚠️ Verificamos si la respuesta no fue exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "Ocurrió un error desconocido al registrar el holiday";
        throw new Error(errorMessage);
      }

      return response.json(); // devolvemos el JSON en caso de éxito
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      setTimeout(() => {
        router.push(route.vacations);
      }, 100);
    },

    onError: (error: any) => {
      // ✅ Mostramos el mensaje real que viene del backend
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
