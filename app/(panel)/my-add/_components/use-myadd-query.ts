"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { addInfoService } from "../services/addInfoServices";

/** Se exporta para que las mutaciones invaliden exactamente esta key. */
export const QUERY_MY_ADD = "query_my_add";

export function useMyAddQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: [QUERY_MY_ADD, conjuntoId],
    queryFn: () => addInfoService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
