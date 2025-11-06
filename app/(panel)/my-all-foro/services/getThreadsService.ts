// forum/getThreadsService.ts
import { parseCookies } from "nookies";

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  polls?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
  }[];
}

export async function getThreadsService(
  conjuntoId: string
): Promise<ForumThread[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${conjuntoId}`;
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
    throw new Error(`Error al obtener los foros: ${response.statusText}`);
  }

  return await response.json();
}
