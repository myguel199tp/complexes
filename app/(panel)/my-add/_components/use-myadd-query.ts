"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { addInfoService } from "../services/addInfoServices";

export function useMyAddQuery() {
  const payload = getTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_MY_ADD = "query_my_add";

  const query = useQuery({
    queryKey: [QUERY_MY_ADD, userId, conjuntoId],
    queryFn: () => addInfoService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    userId,
    conjuntoId,
  };
}
