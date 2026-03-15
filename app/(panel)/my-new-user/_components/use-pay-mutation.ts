import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataPayCoutaServices } from "../services/userPayService";
import { useUiStore } from "./modal/store/new-store";
import { useModalStore } from "./use-store";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationPayUser() {
  const api = new DataPayCoutaServices();
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const { closeSideNew } = useUiStore();
  const { closeModal } = useModalStore();
  const QUERY_USER_REGISTER = "query_user_register";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.PayUserService(conjuntoId, formData);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message?.[0] || "¡Algo salió mal!");
      }

      return response;
    },
    onSuccess: () => {
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
