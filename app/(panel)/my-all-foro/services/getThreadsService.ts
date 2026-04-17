import { ForumThread } from "./response.ts/forum";

export async function getThreadsService(
  conjuntoId: string,
): Promise<ForumThread[]> {
  const url = `/api/cuestion`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  return await response.json();
}
