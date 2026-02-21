export class NewImmovableServices {
  async immovableServices(
    conjuntoId: string,
    data: FormData,
  ): Promise<Response> {
    const response = await fetch(`/api/inmovable/create`, {
      body: data,
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Error al agregar el inmueble");
    }

    return response;
  }
}
