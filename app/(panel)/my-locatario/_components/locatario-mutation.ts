"use client";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { RegisterSubuserServices } from "../services/registerSubuserservices";

export function useMutationLocatario() {
  const api = new RegisterSubuserServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.subuser(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        router.push(route.activity);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
