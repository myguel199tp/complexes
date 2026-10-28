import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { NewsResponse } from "./response/newsResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function allNewsService(
  conjuntoId: string,
): Promise<NewsResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/allNews`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
