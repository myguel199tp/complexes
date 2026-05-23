import { fetchEventSource } from "@microsoft/fetch-event-source";
import nookies from "nookies";
import { NewsResponse } from "../../my-news/services/response/newsResponse";

export interface NewsReaction {
  newsId: string;
  likes: number;
  dislikes: number;
}

interface NewsEvent {
  type: "news" | "reaction";
  payload: NewsResponse | NewsReaction;
}

export function connectNewsEvents(
  baseUrl: string,
  conjuntoId: string,
  onNews: (news: NewsResponse) => void,
  onReaction: (reaction: NewsReaction) => void,
  onError?: (err) => void,
) {
  const controller = new AbortController();

  const cookies = nookies.get(null);
  const accessToken = cookies.accessToken;

  fetchEventSource(`${baseUrl}/api/new-admin/events`, {
    signal: controller.signal,

    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-conjunto-id": conjuntoId,
    },

    async onopen(response) {
      if (!response.ok) {
        throw new Error(`SSE Error ${response.status}`);
      }

      console.log("SSE conectado");
    },

    onmessage(event) {
      try {
        const parsed: NewsEvent = JSON.parse(event.data);

        if (parsed.type === "news") {
          const news = parsed.payload as NewsResponse;

          if (news.conjuntoId === conjuntoId) {
            onNews(news);
          }
        }

        if (parsed.type === "reaction") {
          onReaction(parsed.payload as NewsReaction);
        }
      } catch (error) {
        console.error("SSE parse error:", error);
      }
    },

    onerror(error) {
      console.error("SSE error:", error);

      if (onError) {
        onError(error);
      }
    },
  });

  return {
    close() {
      controller.abort();
    },
  };
}
