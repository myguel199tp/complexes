import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { FavoriteServices } from "../../../services/favoriteService";
import { ICreateFavorite } from "../../../services/response/favoriteResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationFavorites() {
  const api = new FavoriteServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<ICreateFavorite, Error, ICreateFavorite>({
    mutationFn: async (data) => {
      const response = await api.favoriteServices(data, conjuntoId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message ?? "Error desconocido");
      }

      return response.json();
    },
    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.vacations);
    },

    onError: (error) => {
      showAlert(error.message, "error");
    },
  });
}
