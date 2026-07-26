"use client";

import { useQuery } from "@tanstack/react-query";
import { useTokenPayload } from "@/app/components/session-provider";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyFeesService } from "../services/myVipFeesService";

export function useMyFeesQuery() {
  const payload = useTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: ["my-fees", userId, conjuntoId],
    queryFn: () => getMyFeesService(String(conjuntoId)),
    enabled: !!userId && !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    userId,
    conjuntoId,
  };
}
