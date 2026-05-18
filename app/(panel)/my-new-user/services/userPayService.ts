import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataPayCoutaServices {
  async PayUserService(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`,
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
