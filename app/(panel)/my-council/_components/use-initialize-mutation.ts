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
    onSuccess: () => {
      showAlert("¡Consejo inicializado exitosamente!", "success");
      // Antes se escribía a mano `{ active, members }` en la caché de
      // "council_status", una forma que no es la de CouncilStatusResponse: la
      // página leía `status.pendingMeetings.length` sobre undefined y reventaba.
      // Se invalida y se deja que el backend devuelva el estado real.
      queryClient.invalidateQueries({
        queryKey: ["council_status", conjuntoId],
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
