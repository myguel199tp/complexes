import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataForoServices } from "../services/myForoServices";
import { ForumPayload } from "./cosntants";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationForo() {
  const api = new DataForoServices();
  const { conjuntoId } = useConjuntoStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: ForumPayload) => {
      return api.addForo(conjuntoId, formData);
    },
    onSuccess: () => {
      showAlert("¡Foro creado con éxito!", "success");
      // Al listado: el backend lo ordena por createdAt DESC, así que el foro
      // recién creado sale de primero (la invalidación global lo refresca).
      router.push(route.myforo);
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
