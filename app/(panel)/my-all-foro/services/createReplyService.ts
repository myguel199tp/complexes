// forum/createReplyService.ts
import { parseCookies } from "nookies";

export interface CreateReplyDto {
  text: string;
  createdBy: string;
}

export interface Reply {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  threadId: string;
}

export async function createReplyService(
  threadId: string,
  payload: CreateReplyDto
): Promise<Reply> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/forum/${threadId}/reply`;
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error creating reply");
  }

  return res.json();
}
