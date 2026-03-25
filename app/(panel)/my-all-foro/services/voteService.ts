export interface PollOption {
  id: string;
  option: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  createdAt: string;
  options: PollOption[];
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  nameUnit: string;
  conjuntoId: string;
  createdAt: string;
  polls: Poll[];
}

export async function voteService(
  threadId: string,
  pollIndex: number,
  optionId: string,
  conjuntoId: string,
): Promise<ForumThread> {
  const url = `/api/cuestion/${threadId}/polls/${pollIndex}/vote?optionId=${optionId}`;

  const response = await fetch(url, {
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
