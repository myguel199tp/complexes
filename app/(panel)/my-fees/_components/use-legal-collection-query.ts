"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  LegalCaseClosureReason,
  LegalCaseStatus,
  LegalCollectionService,
  OpenLegalCaseBody,
} from "../services/legalCollectionService";

const LEGAL_KEY = "admin-fee-legal";
const PORTFOLIO_KEY = "admin-fee-portfolio";

export function useLegalCasesQuery(
  filters: { status?: LegalCaseStatus; includeClosed?: boolean } = {},
) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [LEGAL_KEY, conjuntoId, filters],
    queryFn: () => LegalCollectionService.list(conjuntoId, filters),
    enabled: !!conjuntoId,
  });
}

/**
 * Invalida cartera y casos a la vez.
 *
 * Trasladar cambia la fila de la cartera —aparece el badge y desaparece el
 * botón—, así que dejar la cartera en caché mostraría la unidad como si nunca
 * se hubiera escalado y el administrador la trasladaría dos veces.
 */
function useRefreshLegal() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [LEGAL_KEY] });
    queryClient.invalidateQueries({ queryKey: [PORTFOLIO_KEY] });
  };
}

/** Trasladar una unidad a cobro jurídico. */
export function useOpenLegalCaseMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const refresh = useRefreshLegal();

  return useMutation({
    mutationFn: ({
      relationId,
      ...body
    }: OpenLegalCaseBody & { relationId: string }) =>
      LegalCollectionService.open(relationId, conjuntoId, body),

    onSuccess: (data) => {
      refresh();
      showAlert(
        `${data.unit.label} trasladada a ${data.statusLabel.toLowerCase()}`,
        "success",
      );
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo trasladar la unidad", "error");
    },
  });
}

export function useUpdateLegalCaseMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const refresh = useRefreshLegal();

  return useMutation({
    mutationFn: ({
      caseId,
      ...body
    }: Partial<OpenLegalCaseBody> & { caseId: string; note?: string }) =>
      LegalCollectionService.update(caseId, conjuntoId, body),

    onSuccess: () => {
      refresh();
      showAlert("Expediente actualizado", "success");
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo actualizar el caso", "error");
    },
  });
}

export function useCloseLegalCaseMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const refresh = useRefreshLegal();

  return useMutation({
    mutationFn: ({
      caseId,
      ...body
    }: {
      caseId: string;
      closureReason: LegalCaseClosureReason;
      note?: string;
    }) => LegalCollectionService.close(caseId, conjuntoId, body),

    onSuccess: () => {
      refresh();
      showAlert("Caso cerrado", "success");
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo cerrar el caso", "error");
    },
  });
}
