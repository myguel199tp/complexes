"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";
import { AddMemberRequest } from "../services/request/councilRequest";

const api = new CouncilService();

export function useAddMemberMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (body: AddMemberRequest) => api.addMember(body),
    onSuccess: () => {
      showAlert("¡Miembro agregado exitosamente!", "success");
      queryClient.invalidateQueries({ queryKey: ["council_members", conjuntoId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al agregar el miembro", "error");
    },
  });
}
