// services/mySocialServices.ts
import { parseCookies } from "nookies";
import type { SocialRequest } from "./request/socialRequest";

export class DataMysocialServices {
  // Cambia SocialRequest por Response
  async registerSocialService(data: SocialRequest): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el foro: ${errorText}`);
    }

    return response;
  }
}
