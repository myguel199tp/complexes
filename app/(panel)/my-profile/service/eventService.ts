import { NewsResponse } from "../../my-news/services/response/newsResponse";

export function connectNewsEvents(
  baseUrl: string,
  conjuntoId: string,
  onMessage: (news: NewsResponse) => void,
  onError?: (err: Event) => void
) {
  const eventSource = new EventSource(`${baseUrl}/api/new-admin/events`, {
    withCredentials: true,
  });

  eventSource.onopen = () => {
    console.log("✅ Conexión SSE abierta");
  };

  eventSource.onmessage = (event) => {
    console.log("📨 Mensaje crudo recibido:", event.data);

    try {
      const newNews: NewsResponse = JSON.parse(event.data);
      console.log("📰 Mensaje parseado:", newNews);

      if (newNews.conjunto_id === conjuntoId) {
        console.log("🎯 Coincide conjuntoId, agregando noticia");
        onMessage(newNews);
      } else {
        console.log(
          "⚠️ Noticia descartada (conjuntoId distinto):",
          newNews.conjunto_id,
          "!==",
          conjuntoId
        );
      }
    } catch (e) {
      console.error("❌ Error parseando SSE:", e);
    }
  };

  eventSource.onerror = (err: Event) => {
    console.error("❌ Error SSE detectado:", err);
    if (onError) onError(err);
    eventSource.close();
  };

  return eventSource;
}
