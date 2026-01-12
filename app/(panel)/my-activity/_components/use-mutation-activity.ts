"use client";
import { useMutation } from "@tanstack/react-query";
import { DataActivityServices } from "../services/activityServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export function useMutationActivity() {
  const api = new DataActivityServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.addActivity(formData);
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
        "error"
      );
    },
  });
}
