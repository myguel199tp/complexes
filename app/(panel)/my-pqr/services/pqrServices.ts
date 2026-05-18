import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataPqrServices {
  async addpqr(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al agregar el archivo: ${errorText}`);
    }

    return response;
  }
}
