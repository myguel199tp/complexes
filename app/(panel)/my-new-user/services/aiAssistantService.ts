import { parseCookies } from "nookies";
import { AiAssistantResponse } from "./response/assistanServiceAi";

export class AiAssistantService {
  async sendMessage(
    message: string,
    conjuntoId: string,
    format: "text" | "table" = "text",
  ): Promise<AiAssistantResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `/api/assistant/${format}`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId, 
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      throw new Error("Error comunicándose con el asistente");
    }

    return response.json();
  }
}
