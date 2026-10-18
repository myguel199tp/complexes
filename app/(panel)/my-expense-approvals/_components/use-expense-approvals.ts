"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { ExpenseApprovalServices } from "@/app/(panel)/my-bills/services/expenseApprovalServices";
import { APPROVER_HISTORY_KEY } from "@/app/(panel)/my-bills/_components/approver-history";

const api = new ExpenseApprovalServices();

export const MY_APPROVER_STATUS_KEY = "expense_approver_me";
const APPROVALS_KEY = "expense_approvals";

/**
 * ¿Aprueba esta persona los gastos del conjunto? Lo usa el menú para mostrar
 * la entrada solo a quien la necesita, con los pendientes como contador.
 */
export function useMyExpenseApproverStatus(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [MY_APPROVER_STATUS_KEY, conjuntoId],
    queryFn: () => api.getMyStatus(),
    enabled: !!conjuntoId && enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: false,
  });
}

export function useExpenseApprovalsQuery(status: "pending" | "reviewed") {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [APPROVALS_KEY, conjuntoId, status],
    queryFn: () => api.list(status),
    enabled: !!conjuntoId,
    retry: false,
  });
}

export function useReviewExpenseMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: ({
      id,
      decision,
      comment,
    }: {
      id: string;
      decision: "approved" | "rejected";
      comment?: string;
    }) =>
      decision === "approved"
        ? api.approve(id, comment)
        : api.reject(id, comment ?? ""),
    onSuccess: (_data, { decision }) => {
      showAlert(
        decision === "approved"
          ? "Aprobaste el gasto. La administración ya puede pagarlo."
          : "Rechazaste el gasto. La administración recibió tu motivo.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY, conjuntoId] });
      queryClient.invalidateQueries({
        queryKey: [APPROVER_HISTORY_KEY, conjuntoId],
      });
      queryClient.invalidateQueries({
        queryKey: [MY_APPROVER_STATUS_KEY, conjuntoId],
      });
    },
    onError: (error: Error) => {
      showAlert(error.message, "error");
    },
  });
}

export function useOpenExpenseFile() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return (id: string, kind: "file" | "receipt" = "file") =>
    api
      .openFile(id, kind)
      .catch((error: Error) => showAlert(error.message, "error"));
}
