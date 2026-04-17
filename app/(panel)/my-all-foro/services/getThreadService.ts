import { ForumThread } from "./response.ts/forum";

export async function getThreadService(
  threadId: string,
  conjuntoId: string,
): Promise<ForumThread> {
  const url = `/api/cuestion/info/${threadId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Error al obtener el foro`);
  }

  return await response.json();
}
