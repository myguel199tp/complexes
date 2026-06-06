import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ForumThread } from "./response.ts/forum";

export async function getThreadsService(
  conjuntoId: string,
): Promise<ForumThread[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  return await response.json();
}
