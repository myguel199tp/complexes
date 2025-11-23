import { parseCookies } from "nookies";

export class CitofonieService {
  async registerVisit(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/register-visit`,
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
      const errorText = await response.text();
      throw new Error(`Error al agregar la noticia: ${errorText}`);
    }

    return response;
  }
}
