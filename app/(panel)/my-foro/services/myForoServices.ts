import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ForumPayload } from "../_components/cosntants";
import { backendMessage } from "@/app/helpers/backendError";

export class DataForoServices {
  async addForo(conjuntoId: string, data: ForumPayload): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/forum`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(backendMessage(errorText, "Error al agregar el foro"));
    }

    return response;
  }
}
