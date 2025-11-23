import { parseCookies } from "nookies";
import { ForumPayload } from "../_components/cosntants";

export class DataForoServices {
  async addForo(data: ForumPayload): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/forum`,
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
