import { parseCookies } from "nookies";

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
  optionId: string
): Promise<ForumThread> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${threadId}/polls/${pollIndex}/vote?optionId=${optionId}`;
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al votar: ${response.statusText}`);
  }

  const data: ForumThread = await response.json();
  return data;
}
