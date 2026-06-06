"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyFeesThisMonthService } from "../services/myVipFessMonthService";

export function useMyFeesThisMonthQuery() {
  const payload = getTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: ["my-fees-this-month", userId, conjuntoId],
    queryFn: () => getMyFeesThisMonthService(String(conjuntoId)),
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
