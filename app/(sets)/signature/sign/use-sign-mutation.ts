// mutations/useMutationHabeas.ts
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { HabeasServices } from "@/app/auth/services/habeasServices";
import { ICreateHabeas } from "@/app/auth/services/response/habeas";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export function useMutationSign() {
  const api = new HabeasServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (data: ICreateHabeas) => {
      const response = await api.createHabeas(data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          "Error al registrar la autorización de datos";
        throw new Error(errorMessage);
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("Autorización aceptada correctamente", "success");
      router.push(route.ensemble);
    },

    onError: (error: any) => {
      showAlert(error.message || "Error en el servidor", "error");
    },
  });
}
