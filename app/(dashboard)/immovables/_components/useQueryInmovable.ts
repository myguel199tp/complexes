// src/hooks/useQueryInmovable.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { Filters, ImmovableService } from "../services/inmovableService";

interface QueryProps {
  filters: Filters;
  page: number;
}
const QUERY_INMOVABLES = "query_inmovables";
export function useQueryInmovable({ filters, page }: QueryProps) {
  const query = useQuery({
    queryKey: [QUERY_INMOVABLES, filters, page],
    queryFn: () =>
      ImmovableService({
        filters,
        page,
        limit: 24,
      }),

    // Evita llamadas innecesarias
    keepPreviousData: true,
    staleTime: 1000 * 5,
    enabled: Boolean(filters),
  });

  return {
    ...query,
  };
}
