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
    if (!conjuntoId) {
      console.log("⚠️ No hay conjuntoId, no conectamos SSE");
      return;
    }

    // 1️⃣ Cargar inicial
    allNewsService(conjuntoId)
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error("❌ Error cargando noticias iniciales:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      });

    // 2️⃣ Suscribirse a SSE
    const eventSource = connectNewsEvents(BASE_URL, conjuntoId, (newNews) => {
      console.log("🆕 Nueva noticia recibida vía SSE:", newNews);
      setData((prev) => [newNews, ...prev]);
    });

    return () => {
      console.log("🔌 Cerrando conexión SSE");
      eventSource.close();
    };
  }, [conjuntoId, BASE_URL]);

  return { data, error, BASE_URL };
}
