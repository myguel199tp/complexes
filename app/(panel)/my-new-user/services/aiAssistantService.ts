import { AiAssistantResponse } from "./response/assistanServiceAi";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class AiAssistantService {
  async sendMessage(
    message: string,
    conjuntoId: string,
    format: "text" | "table" = "text",
  ): Promise<AiAssistantResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat/${format}`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
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
