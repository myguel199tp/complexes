export class NewImmovableServices {
  async immovableServices(data: FormData): Promise<Response> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales/uploadcrate`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar el inmueble");
    }

    return response;
  }
}
