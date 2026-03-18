"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "../services/referralService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMe() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_ME = "query_ME";
  const query = useQuery({
    queryKey: [QUERY_ME, , conjuntoId],
    queryFn: () => getMe(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
