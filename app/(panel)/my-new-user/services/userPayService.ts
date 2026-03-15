export class DataPayCoutaServices {
  async PayUserService(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetch(`/api/fees/create`, {
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
