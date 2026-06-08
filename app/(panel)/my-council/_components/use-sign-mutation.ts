"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useSignMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (meetingId: string) => api.signMeeting(meetingId),
    onSuccess: (_, meetingId) => {
      showAlert("¡Acta firmada exitosamente!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_meeting_signatures", meetingId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al firmar el acta", "error");
    },
  });
}
