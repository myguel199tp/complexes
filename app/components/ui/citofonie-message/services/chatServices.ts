import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ChatMessage } from "./response/messageResponse";
import { backendError } from "@/app/helpers/backendError";

interface Props {
  storedUserId: string;
  recipientId: string;
  infoConjunto: string;
}

export async function chatMessageService({
  recipientId,
  infoConjunto,
}: Props): Promise<ChatMessage[]> {
  // El conjunto va en el header `x-conjunto-id`, que es de donde lo lee el guard
  // del backend; como query param se ignoraba y la petición fallaba con 400.
  // `senderId` ya no se envía: el backend lo toma del token para que nadie pueda
  // leer conversaciones ajenas pasando otro id.
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages?recipientId=${recipientId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": infoConjunto,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  return await response.json();
}
