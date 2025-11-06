"use client";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AddSubUsser } from "../services/subUserService";

export function useMutationSubUSer() {
  const api = new AddSubUsser();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.createSubuser(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

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
