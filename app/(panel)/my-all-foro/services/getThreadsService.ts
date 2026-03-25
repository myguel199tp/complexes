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
