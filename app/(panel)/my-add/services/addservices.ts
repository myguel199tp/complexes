export class DataAddServices {
  async adds(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetch(`/api/market/create`, {
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
