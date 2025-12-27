import { parseCookies } from "nookies";

export class HollidayServices {
  async publishHolliday(id: string): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/${id}/publish`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al publicar el holiday");
    }

    return response;
  }
}
