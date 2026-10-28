import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendMessage } from "@/app/helpers/backendError";

export class DataCertificationAllServices {
  async addCert(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/certification/register`,
      {
        method: "POST",
        body: data,
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(backendMessage(errorText, "Error al agregar el archivo"));
    }

    return response;
  }
}
