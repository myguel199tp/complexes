import { parseCookies } from "nookies";
import { AiAssistantResponse } from "./response/assistanServiceAi";

export class AiAssistantService {
  async sendMessage(
    message: string,
    conjuntoId: string,
    format: "text" | "table",
  ): Promise<AiAssistantResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat/${format}`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
          conjuntoId,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
