import { parseCookies } from "nookies";

export class DataPqrServices {
  async addpqr(conjuntoId: string, data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    if (!token) {
      throw new Error("No se encontró token en el almacenamiento");
    }

    const response = await fetch(`/api/qr/create`, {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el archivo: ${errorText}`);
    }

    return response;
  }
}
