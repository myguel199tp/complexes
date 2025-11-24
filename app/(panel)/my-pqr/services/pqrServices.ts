import { parseCookies } from "nookies";

export class DataPqrServices {
  async addpqr(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    if (!token) {
      throw new Error("No se encontró token en el almacenamiento");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr`,
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
