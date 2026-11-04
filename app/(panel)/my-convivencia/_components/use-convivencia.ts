"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { convivenciaApi } from "../services/convivenciaService";
import { CaseDetail } from "../services/convivenciaTypes";

const KEY = "convivencia";

function useConjuntoId() {
  return useConjuntoStore((state) => state.conjuntoId) ?? "";
}

export function useConvivenciaMe() {
  const conjuntoId = useConjuntoId();
  return useQuery({
    queryKey: [KEY, "me", conjuntoId],
    queryFn: () => convivenciaApi.me(conjuntoId),
    enabled: !!conjuntoId,
    retry: false,
  });
}

export function useCommittee() {
  const conjuntoId = useConjuntoId();
  return useQuery({
    queryKey: [KEY, "members", conjuntoId],
    queryFn: () => convivenciaApi.members(conjuntoId),
    enabled: !!conjuntoId,
  });
}

export function useCommitteeCandidates(enabled: boolean) {
  const conjuntoId = useConjuntoId();
  return useQuery({
    queryKey: [KEY, "candidates", conjuntoId],
    queryFn: () => convivenciaApi.candidates(conjuntoId),
    enabled: enabled && !!conjuntoId,
  });
}

export function useCases(status?: string) {
  const conjuntoId = useConjuntoId();
  return useQuery({
    queryKey: [KEY, "cases", conjuntoId, status ?? ""],
    queryFn: () => convivenciaApi.list(conjuntoId, status),
    enabled: !!conjuntoId,
  });
}

export function useCase(caseId?: string | null) {
  const conjuntoId = useConjuntoId();
  return useQuery({
    queryKey: [KEY, "case", conjuntoId, caseId],
    queryFn: () => convivenciaApi.get(conjuntoId, String(caseId)),
    enabled: !!conjuntoId && !!caseId,
  });
}

/**
 * Una mutación de convivencia: muestra el aviso, refresca la lista y deja el
 * caso actualizado en caché (todas las acciones devuelven el detalle).
 */
export function useConvivenciaMutation<V>(
  fn: (conjuntoId: string, vars: V) => Promise<unknown>,
  successMessage: string,
) {
  const conjuntoId = useConjuntoId();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (vars: V) => fn(conjuntoId, vars),
    onSuccess: (result) => {
      showAlert(successMessage, "success");
      const detail = result as CaseDetail | undefined;
      if (detail && typeof detail === "object" && "capabilities" in detail) {
        queryClient.setQueryData([KEY, "case", conjuntoId, detail.id], detail);
      }
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
