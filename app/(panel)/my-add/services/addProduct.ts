import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataProductService {
  async products(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/untis`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error("Error al agregar el negocio");
    }

    return response;
  }
}
