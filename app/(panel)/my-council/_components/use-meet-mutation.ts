"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";
import { CreateMeetingRequest } from "../services/request/councilRequest";

const api = new CouncilService();

export function useMeetMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (dto: CreateMeetingRequest) => api.createMeeting(dto),
    onSuccess: () => {
      showAlert("¡Reunión creada exitosamente!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_meetings", conjuntoId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al crear la reunión", "error");
    },
  });
}
