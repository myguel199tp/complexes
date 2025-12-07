"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allActivityService } from "../services/activityAllServices";

export function useActivityQuery() {
  const payload = getTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_ACTIVITY = "query_activity";

  const query = useQuery({
    queryKey: [QUERY_ACTIVITY, userId, conjuntoId],
    queryFn: () => allActivityService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    userId,
    conjuntoId,
  };
}
