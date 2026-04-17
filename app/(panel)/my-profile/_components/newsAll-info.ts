"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { allNewsService } from "../../my-news/services/newsAllServices";
import { NewsResponse } from "../../my-news/services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { connectNewsEvents, NewsReaction } from "../service/eventService";

export function useLiveNews() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const queryClient = useQueryClient();

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

  const { data = [], error } = useQuery<NewsResponse[]>({
    queryKey: ["news", conjuntoId],
    queryFn: () => allNewsService(conjuntoId),
    enabled: !!conjuntoId,
  });

  useEffect(() => {
    if (!BASE_URL || !conjuntoId) return;

    const eventSource = connectNewsEvents(
      BASE_URL,
      conjuntoId,

      // nueva noticia
      (newNews) => {
        queryClient.setQueryData<NewsResponse[]>(
          ["news", conjuntoId],
          (old) => {
            if (!old) return [newNews];
            return [newNews, ...old];
          },
        );
      },

      // reacción
      (reaction: NewsReaction) => {
        queryClient.setQueryData<NewsResponse[]>(
          ["news", conjuntoId],
          (old) => {
            if (!old) return old;

            return old.map((item) =>
              item.id === reaction.newsId
                ? {
                    ...item,
                    likes: reaction.likes,
                    dislikes: reaction.dislikes,
                  }
                : item,
            );
          },
        );
      },
    );

    return () => eventSource.close();
  }, [BASE_URL, conjuntoId, queryClient]);

  return {
    data,
    error,
    BASE_URL,
    queryClient, // ✅ esto reemplaza setData
  };
}
