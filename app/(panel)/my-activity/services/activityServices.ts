import { parseCookies } from "nookies";

export class DataActivityServices {
  async addActivity(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/activities/register-activity`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar la actividad");
    }

    return response;
  }
}
