"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSession } from "@/app/components/session-provider";
import {
  updateProfileService,
  UpdateProfileDto,
} from "../services/updateProfileService";

const QUERY_INFO = "query_info";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { reload: reloadSession } = useSession();

  return useMutation<void, Error, UpdateProfileDto>({
    mutationFn: (dto) => updateProfileService(conjuntoId, dto),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_INFO] });
      showAlert("Perfil actualizado correctamente", "success");

      // El sidebar pinta nombre y foto desde el JWT, que se firmó en el login:
      // sin rotarlo seguiría mostrando los datos viejos hasta el próximo refresco.
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });
        if (res.ok) await reloadSession();
      } catch {
        // Si falla, el SessionRefresher lo actualizará en su próximo ciclo.
      }
    },
    onError: (error) => {
      showAlert(error.message || "Error al actualizar el perfil", "error");
    },
  });
}
