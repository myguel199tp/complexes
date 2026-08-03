"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { AccessPassResponse } from "@/app/(panel)/my-citofonia/services/response/AccessPassResponse";
import {
  CreateAccessPassPayload,
  createAccessPass,
  myAccessPasses,
  revokeAccessPass,
} from "@/app/(panel)/my-citofonia/services/accessPassService";

export function useMyAccessPasses() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<AccessPassResponse[]>({
    queryKey: ["access-passes", conjuntoId],
    queryFn: () => myAccessPasses(conjuntoId!),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAccessPass() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccessPassPayload) =>
      createAccessPass(conjuntoId, payload),

    onSuccess: () => {
      showAlert("Pase creado. Compártelo con tu visitante.", "success");
      queryClient.invalidateQueries({ queryKey: ["access-passes"] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo crear el pase", "error");
    },
  });
}

export function useRevokeAccessPass() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      revokeAccessPass(conjuntoId, id, reason),

    onSuccess: () => {
      showAlert("Pase revocado", "success");
      queryClient.invalidateQueries({ queryKey: ["access-passes"] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo revocar el pase", "error");
    },
  });
}
