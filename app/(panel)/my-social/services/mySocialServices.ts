// services/mySocialServices.ts
import { parseCookies } from "nookies";
import type { SocialRequest } from "./request/socialRequest";

export class DataMysocialServices {
  // Cambia SocialRequest por Response
  async registerSocialService(data: SocialRequest): Promise<Response> {
    const { accessToken: token } = parseCookies();

    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
  }
}
