"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

import {
  addContractRequestFilesService,
  addContractRequestMessageService,
  createContractRequestService,
  notifyInsurerService,
  updateContractRequestService,
  UpdateContractRequestPayload,
} from "../../services/contractRequestService";
import {
  QUERY_CONTRACT_REQUEST,
  QUERY_CONTRACT_REQUESTS,
} from "./requests-query";

/**
 * Toda mutación de una solicitud invalida la lista y el detalle: la respuesta
 * del backend trae el expediente completo, pero la lista abierta detrás del
 * modal se quedaría con el estado viejo.
 */
function useInvalidateRequests() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_CONTRACT_REQUESTS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_CONTRACT_REQUEST] });
  };
}

export function useCreateContractRequest(onDone?: () => void) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: (data: FormData) =>
      createContractRequestService(conjuntoId, data),
    onSuccess: (response) => {
      showAlert(response.message ?? "Solicitud radicada", "success");
      invalidate();
      onDone?.();
    },
    onError: () => {
      showAlert("No se pudo radicar la solicitud", "error");
    },
  });
}

export function useUpdateContractRequest(requestId: number) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: (payload: UpdateContractRequestPayload) =>
      updateContractRequestService(conjuntoId, requestId, payload),
    onSuccess: () => {
      showAlert("Solicitud actualizada", "success");
      invalidate();
    },
    onError: () => {
      showAlert("No se pudo actualizar la solicitud", "error");
    },
  });
}

export function useAddRequestMessage(requestId: number) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: (message: string) =>
      addContractRequestMessageService(conjuntoId, requestId, message),
    onSuccess: invalidate,
    onError: () => {
      showAlert("No se pudo enviar el mensaje", "error");
    },
  });
}

export function useAddRequestFiles(requestId: number) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: (data: FormData) =>
      addContractRequestFilesService(conjuntoId, requestId, data),
    onSuccess: () => {
      showAlert("Evidencias agregadas", "success");
      invalidate();
    },
    onError: () => {
      showAlert("No se pudieron subir las evidencias", "error");
    },
  });
}

export function useNotifyInsurer(requestId: number) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateRequests();

  return useMutation({
    mutationFn: () => notifyInsurerService(conjuntoId, requestId),
    onSuccess: (response) => {
      showAlert(response.message ?? "Reporte enviado", "success");
      invalidate();
    },
    onError: () => {
      showAlert("No se pudo enviar el reporte a la aseguradora", "error");
    },
  });
}
