// useLiveNews.ts
"use client";

import { useEffect, useState } from "react";
import { allNewsService } from "../../my-news/services/newsAllServices";
import { NewsResponse } from "../../my-news/services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { connectNewsEvents } from "../service/eventService";

export function useLiveNews() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!conjuntoId) return;

    allNewsService(conjuntoId)
      .then((result) => setData(result))
      .catch((err) => {
        setError(err.message || "Error desconocido");
      });

    const eventSource = connectNewsEvents(BASE_URL, conjuntoId, (newNews) => {
      setData((prev) => [newNews, ...prev]);
    });

    return () => eventSource.close();
  }, [conjuntoId, BASE_URL]);

  return { data, error, BASE_URL };
}
