import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataHolidayServices {
  async addHolliday(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/create-holliday`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error("Error al agregar vacional");
    }

    return response;
  }
}
