import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataPayCoutaServices } from "../services/userPayService";
import { useUiStore } from "./modal/store/new-store";

export function useMutationPayUser() {
  const api = new DataPayCoutaServices();

  const showAlert = useAlertStore((state) => state.showAlert);
  const { closeSideNew } = useUiStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await api.PayUserService(formData);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("¡Operación exitosa!", "success");
        setTimeout(() => {
          closeSideNew();
        }, 100);
        return response;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "¡Algo salió mal!";

        showAlert(message, "error");
        throw error;
      }
    },
  });
}
