import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  DataExternalStayServices,
  ExternalStayRequest,
  ExternalStayResponse,
} from "../services/externalStayService";

const api = new DataExternalStayServices();

export function useCreateStayMutation(externalListingId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ExternalStayResponse, Error, ExternalStayRequest>({
    mutationFn: (data) => api.createStay(externalListingId, data),
    onSuccess: () => {
      showAlert("¡Estadía registrada!", "success");
      queryClient.invalidateQueries({
        queryKey: ["external-stays", externalListingId],
      });
    },
    onError: (error) => {
      showAlert(error.message || "Error registrando la estadía", "error");
    },
  });
}

export function useMarkStayAsPaidMutation(externalListingId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ExternalStayResponse, Error, string>({
    mutationFn: (stayId) => api.markAsPaid(stayId),
    onSuccess: () => {
      showAlert("Estadía marcada como pagada", "success");
      queryClient.invalidateQueries({
        queryKey: ["external-stays", externalListingId],
      });
    },
    onError: (error) => {
      showAlert(error.message || "Error marcando la estadía como pagada", "error");
    },
  });
}
