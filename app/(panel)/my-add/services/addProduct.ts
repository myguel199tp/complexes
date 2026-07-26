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

    // No se lanza aquí: la mutación lee el cuerpo del error para mostrar el
    // mensaje real del backend en lugar de uno genérico.
    return response;
  }
}
