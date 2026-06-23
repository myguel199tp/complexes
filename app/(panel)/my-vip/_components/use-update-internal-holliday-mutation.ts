"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { updateInternalHollidaySetting } from "../../my-holliday/services/conjuntoSettingsService";
import { CONJUNTO_SETTINGS_QUERY } from "../../my-holliday/_components/holliday/use-conjunto-settings-query";

export function useUpdateInternalHollidayMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<void, Error, boolean>({
    mutationFn: (enabled) =>
      updateInternalHollidaySetting(conjuntoId, enabled).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONJUNTO_SETTINGS_QUERY, conjuntoId],
      });
      showAlert("Configuración actualizada correctamente", "success");
    },
    onError: (error) => {
      showAlert(error.message || "Error al actualizar la configuración", "error");
    },
  });
}
