// mutations/useMutationHabeas.ts
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { HabeasServices } from "@/app/auth/services/habeasServices";
import { ICreateHabeas } from "@/app/auth/services/response/habeas";
import { useHabeasFlowStore } from "../useHabeasFlowStore";

export function useMutationHabeas() {
  const api = new HabeasServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const completeProteccionDatos = useHabeasFlowStore(
    (state) => state.completeProteccionDatos,
  );

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

      // 👇 Cambia el flujo
      completeProteccionDatos();
    },

    onError: (error: any) => {
      showAlert(error.message || "Error en el servidor", "error");
    },
  });
}
