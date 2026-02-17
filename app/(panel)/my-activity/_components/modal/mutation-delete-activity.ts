"use client";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { DataActivityServices } from "../../services/activityServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationDeleteActivity(id: string) {
  const router = useRouter();
  const api = new DataActivityServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async () => {
      return api.deleteActivity(conjuntoId, id);
    },
    retry: false,
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.activity);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert(
        "Verifica que tu cuenta esté activa y que tengas los permisos necesarios, o intenta nuevamente más tarde.",
        "error",
      );
    },
  });
}
