"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getSellerAccess } from "../../../my-news/services/subscription-user";

export function useSellerAccessQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const moduleName = "seller";

  const QUERY_KEY_SELLER = "query_seller_access";

  const query = useQuery({
    queryKey: [QUERY_KEY_SELLER, conjuntoId, moduleName],
    queryFn: () => getSellerAccess(String(conjuntoId), moduleName),
    enabled: !!conjuntoId && !!moduleName,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    conjuntoId,
  };
}
