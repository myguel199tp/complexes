"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { addCouncilUserService } from "../services/councilUserSevices";

export function useMyUserCouncilQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_MY_ADD_COUNCIL = "query_my_add_council";

  const query = useQuery({
    queryKey: [QUERY_MY_ADD_COUNCIL, conjuntoId],
    queryFn: () => addCouncilUserService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
