export class DataProductService {
  async products(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetch(`/api/market/create/product`, {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error("Error al agregar el negocio");
    }

    return response;
  }
}
