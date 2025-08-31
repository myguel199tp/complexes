"use client"; // 👈 muy importante si vas a usar useRouter en este archivo o en el que consuma el hook

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
      // Aquí solo llamamos el servicio
      return api.addActivity(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        // 👇 aseguramos que navegue después del alert
        setTimeout(() => {
          router.push(route.activity);
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
