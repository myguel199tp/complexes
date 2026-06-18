"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useStartCallMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (meetingId: string) => api.startCall(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ["council_call_status", meetingId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al iniciar la videollamada", "error");
    },
  });
}

export function useEndCallMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (meetingId: string) => api.endCall(meetingId),
    onSuccess: (_, meetingId) => {
      showAlert("Videollamada finalizada", "success");
      queryClient.invalidateQueries({ queryKey: ["council_call_status", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["council_meeting_history", meetingId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al finalizar la videollamada", "error");
    },
  });
}
