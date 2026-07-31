import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import type { SocialRequest } from "./request/socialRequest";

export class DataMysocialServices {
  async registerSocialService(
    conjuntoId: string,
    data: SocialRequest,
  ): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity`,
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
      // El backend explica el motivo (aforo lleno, tope del apartamento,
      // menores sin acompañante); ese texto es lo que debe ver el usuario.
      const errorText = await response.text();

      let message = "No se pudo crear la reserva";

      try {
        const parsed = errorText ? JSON.parse(errorText) : null;

        if (typeof parsed?.message === "string") {
          message = parsed.message;
        } else if (Array.isArray(parsed?.message)) {
          message = parsed.message.join(", ");
        }
      } catch {
        if (errorText) message = errorText;
      }

      throw new Error(message);
    }

    return response;
  }
}
