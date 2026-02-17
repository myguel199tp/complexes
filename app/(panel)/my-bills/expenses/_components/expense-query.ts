// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExpenseServices } from "../../services/dataExpenseServices";

const api = new DataExpenseServices();

export function useInfoExpenseQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO_EXPENSE = "query_info_expense";
  const query = useQuery({
    queryKey: [QUERY_INFO_EXPENSE, conjuntoId],
    queryFn: () => api.getExpenses(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
