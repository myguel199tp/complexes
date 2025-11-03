import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { FavoriteInmovableServices } from "../services/favorite-inmovable-service";
import { ICreateFavoriteInmovable } from "../services/response/favoriteInmovableResponse";

export function useMutationFavoritesInmovables() {
  const api = new FavoriteInmovableServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (data: ICreateFavoriteInmovable) => {
      const response = await api.favoriteInmovableServices(data);

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
