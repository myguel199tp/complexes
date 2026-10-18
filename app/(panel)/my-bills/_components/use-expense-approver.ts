"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { ExpenseApprovalServices } from "../services/expenseApprovalServices";
import { APPROVER_HISTORY_KEY } from "./approver-history";

const api = new ExpenseApprovalServices();

const APPROVER_KEY = "expense_approver";
const CANDIDATES_KEY = "expense_approver_candidates";

export function useExpenseApproverQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [APPROVER_KEY, conjuntoId],
    queryFn: () => api.getApprover(),
    enabled: !!conjuntoId,
  });
}

export function useApproverCandidatesQuery(enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [CANDIDATES_KEY, conjuntoId],
    queryFn: () => api.getCandidates(),
    enabled: !!conjuntoId && enabled,
  });
}

export function useDesignateApproverMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: (userId: string | null) =>
      userId ? api.designate(userId) : api.removeDesignation(),
    onSuccess: (data, userId) => {
      queryClient.setQueryData([APPROVER_KEY, conjuntoId], data);
      // Cambiar de aprobador cierra un periodo y abre otro.
      queryClient.invalidateQueries({
        queryKey: [APPROVER_HISTORY_KEY, conjuntoId],
      });
      showAlert(
        userId
          ? "Listo: ese propietario aprobará los gastos"
          : "Se quitó al propietario que aprobaba los gastos",
        "success",
      );
    },
    onError: (error: Error) => {
      showAlert(error.message, "error");
    },
  });
}
