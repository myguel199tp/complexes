"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allActivityService } from "../services/activityAllServices";

export function useActivityQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = useConjuntoStore((state) => state.userId);

  const QUERY_ACTIVITY = "query_activity";

  const query = useQuery({
    queryKey: [QUERY_ACTIVITY, storedUserId, conjuntoId],
    queryFn: () => allActivityService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    storedUserId,
    conjuntoId,
  };
}
