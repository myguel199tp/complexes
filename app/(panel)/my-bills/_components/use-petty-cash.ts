"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { PettyCashServices } from "../services/pettyCashServices";

const api = new PettyCashServices();

export const PETTY_CASH_KEY = "petty_cash";

/** Saldo, recargas y gastos de la caja menor. */
export function usePettyCashQuery(enabled = true) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [PETTY_CASH_KEY, conjuntoId],
    queryFn: () => api.getSummary(),
    enabled: !!conjuntoId && enabled,
    retry: false,
  });
}

export function useAssignPettyCashMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: ({ amount, note }: { amount: number; note?: string }) =>
      api.assign(amount, note),
    onSuccess: (data) => {
      queryClient.setQueryData([PETTY_CASH_KEY, conjuntoId], data);
      showAlert("Caja menor recargada. La administración ya lo sabe.", "success");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });
}

export function useRegisterPettyCashExpenseMutation() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: (form: FormData) => api.registerExpense(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PETTY_CASH_KEY, conjuntoId] });
      queryClient.invalidateQueries({
        queryKey: ["query_info_expense", conjuntoId],
      });
    },
  });
}
