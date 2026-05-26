"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allSidebarService } from "./services/sidebarServices";

export function useSidebarQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_SIDEBAR = "query_info";

  const query = useQuery({
    queryKey: [QUERY_SIDEBAR, conjuntoId],

    queryFn: async () => {
      const response = await allSidebarService(String(conjuntoId));

      return response;
    },

    enabled: !!conjuntoId,
  });

  return {
    ...query,
    conjuntoId,
  };
}
