import { parseCookies } from "nookies";

export class DataCertificationServices {
  async addCertification(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/record/register-record`,
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
      throw new Error(`Error al agregar el archivo: ${errorText}`);
    }

    return response;
  }
}
