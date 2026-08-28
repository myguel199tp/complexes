import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
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
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation<ExternalStayResponse, Error, string>({
    mutationFn: (stayId) => api.markAsPaid(stayId, String(conjuntoId)),
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

/**
 * Igual que `useMarkStayAsPaidMutation`, pero invalidando todo el prefijo
 * `external-stays`: la tabla consolidada de `/my-external` no está atada a un
 * listing concreto, así que no puede invalidar por id de plataforma.
 */
export function useMarkOwnerStayAsPaidMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation<ExternalStayResponse, Error, string>({
    mutationFn: (stayId) => api.markAsPaid(stayId, String(conjuntoId)),
    onSuccess: () => {
      showAlert("Estadía marcada como pagada", "success");
      queryClient.invalidateQueries({ queryKey: ["external-stays"] });
    },
    onError: (error) => {
      showAlert(error.message || "Error marcando la estadía como pagada", "error");
    },
  });
}
