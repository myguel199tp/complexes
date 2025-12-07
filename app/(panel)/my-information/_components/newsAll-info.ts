// hooks/useNewsAllInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { allNewsService } from "../../my-news/services/newsAllServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { NewsResponse } from "../../my-news/services/response/newsResponse";

export function useNewsAllInfoQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const QUERY_KEY_NEW = "all_news_info";

  const query = useQuery<NewsResponse[]>({
    queryKey: [QUERY_KEY_NEW, conjuntoId],
    queryFn: () => allNewsService(String(conjuntoId)),
    enabled: !!conjuntoId,
    staleTime: 1000 * 60 * 2,
  });

  return {
    ...query,
    BASE_URL,
    conjuntoId,
  };
}
