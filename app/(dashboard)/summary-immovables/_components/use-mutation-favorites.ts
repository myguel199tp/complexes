import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { FavoriteInmovableServices } from "../services/favorite-inmovable-service";
import { ICreateFavoriteInmovable } from "../services/response/favoriteInmovableResponse";
import { InmovableResponses } from "../../immovables/services/response/inmovableResponses";

export function useMutationFavoritesInmovables() {
  const api = new FavoriteInmovableServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<InmovableResponses, Error, ICreateFavoriteInmovable>({
    mutationFn: async (data) => {
      const response = await api.favoriteInmovableServices(data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "Ocurrió un error desconocido al registrar el holiday";
        throw new Error(errorMessage);
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.vacations);
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
