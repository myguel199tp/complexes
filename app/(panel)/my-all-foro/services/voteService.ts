import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ForumThread } from "./response.ts/forum";

export async function voteService(
  threadId: string,
  pollIndex: number,
  optionId: string,
  conjuntoId: string,
): Promise<ForumThread> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${threadId}/polls/${pollIndex}/vote?optionId=${optionId}`;

  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Error al votar`);
  }

  return await response.json(); // retorna ForumThread actualizado
}
