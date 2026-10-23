import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataHolidayServices {
  /** Devuelve la respuesta aunque falle: el mensaje lo lee la mutación. */
  async addHolliday(conjuntoId: string, data: FormData): Promise<Response> {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/create-holliday`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );
  }
}
