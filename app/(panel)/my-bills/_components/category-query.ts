// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExpenseCategoryServices } from "../services/dataExpenseCategoryServices";

const api = new DataExpenseCategoryServices();

export function useInfoCategoriesQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO_CATEGORY = "query_info_category";
  const query = useQuery({
    queryKey: [QUERY_INFO_CATEGORY, conjuntoId],
    queryFn: () => api.getCategories(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
