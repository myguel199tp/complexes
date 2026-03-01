"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { addInfoService } from "../services/addInfoServices";

export function useMyAddQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_MY_ADD = "query_my_add";
  const storedUserId = useConjuntoStore((state) => state.userId);

  const query = useQuery({
    queryKey: [QUERY_MY_ADD, storedUserId, conjuntoId],
    queryFn: () => addInfoService(String(conjuntoId), storedUserId),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    storedUserId,
    conjuntoId,
  };
}
