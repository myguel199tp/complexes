// forum/getThreadService.ts
import { parseCookies } from "nookies";

import { ForumThread } from "./getThreadsService";

export async function getThreadService(
  threadId: string,
  conjuntoId: string
): Promise<ForumThread> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${threadId}/${conjuntoId}`;
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener el foro: ${response.statusText}`);
  }

  return await response.json();
}
