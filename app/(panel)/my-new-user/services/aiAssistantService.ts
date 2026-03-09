import { parseCookies } from "nookies";
import { AiAssistantResponse } from "./response/assistanServiceAi";

export class AiAssistantService {
  async sendMessage(
    message: string,
    conjuntoId: string, // 🔹 ahora lo pasamos al proxy vía header
    format: "text" | "table" = "text",
  ): Promise<AiAssistantResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `/api/assistant/${format}`, // proxy
      {
        method: "POST",
        body: JSON.stringify({ message }), // solo el mensaje
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId, // 🔹 header obligatorio
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
