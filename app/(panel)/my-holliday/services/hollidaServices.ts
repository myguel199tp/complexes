export class DataHolidayServices {
  async addHolliday(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetch(`/api/vacation/crerate`, {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error("Error al agregar vacional");
    }

    return response;
  }
}
