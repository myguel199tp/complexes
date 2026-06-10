"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useInitializeMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (userIds: string[]) =>
      api.initialize({ userIds, conjuntoId: String(conjuntoId) }),
    onSuccess: (data) => {
      showAlert("¡Consejo inicializado exitosamente!", "success");
      queryClient.setQueryData(["council_status", conjuntoId], {
        active: true,
        members: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["council_members", conjuntoId],
      });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al inicializar el consejo", "error");
    },
  });
}
