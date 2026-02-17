import { NewsResponse } from "./response/newsResponse";

export async function allNewsService(
  conjuntoId: string,
): Promise<NewsResponse[]> {
  const response = await fetch("/api/news", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include", // importante
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
