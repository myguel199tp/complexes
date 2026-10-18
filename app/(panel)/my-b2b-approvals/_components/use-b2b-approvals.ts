"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  approveProposal,
  getApprovalsToDecide,
  getMyApprovalStatus,
  rejectApproval,
} from "@/app/(panel)/my-b2b/services/b2bApprovalService";

export const MY_B2B_APPROVAL_STATUS_KEY = "b2b_approval_me";
const TO_DECIDE_KEY = "b2b_approvals_to_decide";

/**
 * ¿Decide esta persona contrataciones del conjunto? Lo usa el menú para
 * mostrar la entrada solo al presidente designado y a los miembros del
 * consejo, con las pendientes como contador.
 */
export function useMyB2bApprovalStatus(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [MY_B2B_APPROVAL_STATUS_KEY, conjuntoId],
    queryFn: () => getMyApprovalStatus(conjuntoId),
    enabled: !!conjuntoId && enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: false,
  });
}

export function useB2bApprovalsToDecide(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [TO_DECIDE_KEY, conjuntoId],
    queryFn: () => getApprovalsToDecide(conjuntoId),
    enabled: !!conjuntoId && enabled,
    retry: false,
  });
}

export function useDecideB2bApproval() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (
      p:
        | { id: string; decision: "approve"; itemId: string; comment?: string }
        | { id: string; decision: "reject"; reason: string },
    ) =>
      p.decision === "approve"
        ? approveProposal(conjuntoId, p.id, {
            itemId: p.itemId,
            comment: p.comment,
          })
        : rejectApproval(conjuntoId, p.id, p.reason),
    onSuccess: (_data, p) => {
      showAlert(
        p.decision === "approve"
          ? "Elegiste la propuesta. La administración y el proveedor ya fueron avisados."
          : "Dijiste que ninguna. La administración recibió tu motivo.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: [TO_DECIDE_KEY, conjuntoId] });
      queryClient.invalidateQueries({
        queryKey: [MY_B2B_APPROVAL_STATUS_KEY, conjuntoId],
      });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });
}
