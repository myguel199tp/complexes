import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ForumThread } from "./response.ts/forum";

export async function getThreadService(
  threadId: string,
  conjuntoId: string,
): Promise<ForumThread> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${threadId}`;

  const response = await fetchWithAuth(url, {
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
