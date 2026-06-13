"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  updateProfileService,
  UpdateProfileDto,
} from "../services/updateProfileService";

const QUERY_INFO = "query_info";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<void, Error, UpdateProfileDto>({
    mutationFn: (dto) => updateProfileService(conjuntoId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_INFO] });
      showAlert("Perfil actualizado correctamente", "success");
    },
    onError: (error) => {
      showAlert(error.message || "Error al actualizar el perfil", "error");
    },
  });
}
