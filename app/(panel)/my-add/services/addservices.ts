import { parseCookies } from "nookies";

export class DataAddServices {
  async adds(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/file/uploads`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar el negocio");
    }

    return response;
  }
}
