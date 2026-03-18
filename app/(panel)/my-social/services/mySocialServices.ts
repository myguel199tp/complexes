import type { SocialRequest } from "./request/socialRequest";

export class DataMysocialServices {
  async registerSocialService(
    conjuntoId: string,
    data: SocialRequest,
  ): Promise<Response> {
    const response = await fetch(`/api/reserver/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el foro: ${errorText}`);
    }

    return response;
  }
}
