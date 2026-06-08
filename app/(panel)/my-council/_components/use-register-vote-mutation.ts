"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { CouncilService } from "../services/councilServices";
import { VoteRequest } from "../services/request/councilRequest";

const api = new CouncilService();

export function useRegisterVoteMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (dto: VoteRequest) => api.vote(dto),
    onSuccess: (_, variables) => {
      showAlert("¡Voto registrado!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_vote_results", variables.voteId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al registrar el voto", "error");
    },
  });
}
