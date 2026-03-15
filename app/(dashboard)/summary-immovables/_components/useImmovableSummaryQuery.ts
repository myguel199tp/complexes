"use client";

import { useQuery } from "@tanstack/react-query";
import { immovableSummaryService } from "../services/summary-inmovables-service";

export function useImmovableSummaryQuery(id?: string) {
  const QUERY_IMMOVABLE_SUMMARY = "query_immovable_summary";

  const query = useQuery({
    queryKey: [QUERY_IMMOVABLE_SUMMARY, id],
    queryFn: () => immovableSummaryService({ id }),
    enabled: !!id,
  });

  return query;
}
