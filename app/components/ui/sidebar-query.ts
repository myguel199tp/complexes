"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { allSidebarService } from "./services/sidebarServices";

export function useSidebarQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  console.log("conjuntoId hook", conjuntoId);

  const QUERY_SIDEBAR = "query_info";

  const query = useQuery({
    queryKey: [QUERY_SIDEBAR, conjuntoId],

    queryFn: async () => {
      console.log("ejecutando queryFn");
      console.log("conjuntoId enviado", conjuntoId);

      const response = await allSidebarService(String(conjuntoId));

      console.log("respuesta queryFn", response);

      return response;
    },

    enabled: !!conjuntoId,
  });

  console.log("query completa", query);

  return {
    ...query,
    conjuntoId,
  };
}
