import { ChatMessage } from "./response/messageResponse";

interface Props {
  storedUserId: string;
  recipientId: string;
  infoConjunto: string;
}

export async function chatMessageService({
  storedUserId,
  recipientId,
  infoConjunto,
}: Props): Promise<ChatMessage[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages?senderId=${storedUserId}&recipientId=${recipientId}&conjuntoId=${infoConjunto}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
