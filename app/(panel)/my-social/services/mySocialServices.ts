import { parseCookies } from "nookies";
import { SocialRequest } from "./request/socialRequest";

export class DataMysocialServices {
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
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Error al reservar");
    }

    return response;
  }
}
