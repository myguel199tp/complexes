"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { CouncilService } from "../services/councilServices";
import { CreateVoteRequest } from "../services/request/councilRequest";

const api = new CouncilService();

export function useVoteMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (dto: CreateVoteRequest) => api.createVote(dto),
    onSuccess: (_, variables) => {
      showAlert("¡Votación creada exitosamente!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_meeting_votes", variables.meetingId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al crear la votación", "error");
    },
  });
}
