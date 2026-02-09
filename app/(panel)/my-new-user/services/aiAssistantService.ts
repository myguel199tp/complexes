import { parseCookies } from "nookies";

export interface AiAssistantResponse {
  text: string;
  data?: any;
}

export class AiAssistantService {
  async sendMessage(
    message: string,
    conjuntoId: string,
  ): Promise<AiAssistantResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-assistant/chat`,
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
