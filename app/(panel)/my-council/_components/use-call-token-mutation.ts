"use client";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useCallTokenMutation() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (meetingId: string) => api.getCallToken(meetingId),
    onError: (error: Error) => {
      showAlert(error.message || "Error al unirse a la videollamada", "error");
    },
  });
}
