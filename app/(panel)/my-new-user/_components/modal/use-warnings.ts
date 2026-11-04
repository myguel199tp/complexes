import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  cancelWarningService,
  createWarningService,
  getUnitHistoryService,
} from "../../services/userWarningService";
import { WarningRequest } from "../../services/request/warningRequest";

export const UNIT_HISTORY_KEY = "query-unit-discipline-history";

/** Llamados y multas de la unidad de `relationId`. */
export function useUnitHistoryQuery(relationId?: string, enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [UNIT_HISTORY_KEY, conjuntoId, relationId],
    queryFn: () => getUnitHistoryService(conjuntoId, String(relationId)),
    enabled: enabled && !!conjuntoId && !!relationId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateWarningMutation() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (data: WarningRequest) => createWarningService(conjuntoId, data),

    onSuccess: () => {
      showAlert("Llamado de atención enviado", "success");
      queryClient.invalidateQueries({ queryKey: [UNIT_HISTORY_KEY] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}

export function useCancelWarningMutation() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (id: string) => cancelWarningService(conjuntoId, id),

    onSuccess: () => {
      showAlert("Llamado de atención anulado", "success");
      queryClient.invalidateQueries({ queryKey: [UNIT_HISTORY_KEY] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
