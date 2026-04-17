import { parseCookies } from "nookies";
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
  onError?: (err: Event) => void,
) {
  const eventSource = new EventSource(`${baseUrl}/api/new-admin/events`, {
    withCredentials: true,
  });

  eventSource.onmessage = (event: MessageEvent<string>) => {
    try {
      const parsed: NewsEvent = JSON.parse(event.data);

      if (parsed.type === "news") {
        const news = parsed.payload as NewsResponse;

        if (news.conjuntoId === conjuntoId) {
          onNews(news);
        }
      }

      if (parsed.type === "reaction") {
        const reaction = parsed.payload as NewsReaction;
        onReaction(reaction);
      }
    } catch (error) {
      console.error("SSE parse error:", error);
    }
  };

  eventSource.onerror = (err: Event) => {
    console.error("SSE error:", err);
    if (onError) onError(err);
    eventSource.close();
  };

  return eventSource;
}

export async function voteNews(
  baseUrl: string,
  newsId: string,
  type: "like" | "dislike",
  conjuntoId: string,
): Promise<void> {
  const cookies = parseCookies();
  const token = cookies.accessToken;
  await fetch(`${baseUrl}/api/new-admin/${newsId}/vote`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ type }),
  });
}
