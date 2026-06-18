"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useStartMeetingMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (id: string) => api.startMeeting(id, conjuntoId),
    onSuccess: (_, id) => {
      showAlert("¡Reunión iniciada!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_meeting", id] });
      queryClient.invalidateQueries({
        queryKey: ["council_meetings", conjuntoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["council_status", conjuntoId],
      });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al iniciar la reunión", "error");
    },
  });
}
