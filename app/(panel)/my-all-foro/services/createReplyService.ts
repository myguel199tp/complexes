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
  payload: CreateReplyDto,
  conjuntoId: string,
): Promise<Reply> {
  const url = `/api/cuestion/create/${threadId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error creando reply");
  }

  return res.json();
}
