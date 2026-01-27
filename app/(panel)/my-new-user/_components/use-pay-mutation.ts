import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataPayCoutaServices } from "../services/userPayService";
import { useUiStore } from "./modal/store/new-store";
import { useModalStore } from "./use-store";
import { QUERY_USER_REGISTER } from "./table";

export function useMutationPayUser() {
  const api = new DataPayCoutaServices();
  const queryClient = useQueryClient();

  const showAlert = useAlertStore((state) => state.showAlert);
  const { closeSideNew } = useUiStore();
  const { closeModal } = useModalStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.PayUserService(formData);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message?.[0] || "¡Algo salió mal!");
      }

      return response;
    },
    onSuccess: () => {
      // 🔁 INVALIDA LA QUERY
      queryClient.invalidateQueries({
        queryKey: [QUERY_USER_REGISTER],
      });

      showAlert("¡Operación exitosa!", "success");
      closeSideNew();
      closeModal();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "¡Algo salió mal!";
      showAlert(message, "error");
    },
  });
}
