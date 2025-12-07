// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { allUserVipService } from "../services/myVipInfoService";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useInfoQuery() {
  const payload = getTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const QUERY_INFO = "query_info";
  const query = useQuery({
    queryKey: [QUERY_INFO, userId, conjuntoId],
    queryFn: () => allUserVipService(String(conjuntoId), String(userId)),
    enabled: !!conjuntoId && !!userId,
  });

  return {
    ...query,
    userId,
    conjuntoId,
  };
}
