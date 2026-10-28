import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { MultaRequest } from "./request/multaRequest";
import { backendMessage } from "@/app/helpers/backendError";

export async function userMultaService(conjuntoId: string, data: MultaRequest) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/resident-fines`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
