// hooks/useNewsAllInfo.ts
"use client";
import { useEffect, useState } from "react";
import { allNewsService } from "../../my-news/services/newsAllServices";
import { NewsResponse } from "../../my-news/services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useNewsAllInfo() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return; // 👈 Evita ejecutar si es null

      try {
        const result = await allNewsService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return { data, error, BASE_URL };
}
