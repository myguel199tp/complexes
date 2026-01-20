// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataCommmonAreaServices } from "../../services/commonAreaServices";

const api = new DataCommmonAreaServices();

export function useAreaQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO_AREA = "query_info_area";
  const query = useQuery({
    queryKey: [QUERY_INFO_AREA, conjuntoId],
    queryFn: () => api.getCommmonArea(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
