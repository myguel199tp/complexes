import { parseCookies } from "nookies";

export class DataHolidayServices {
  async addHolliday(data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/create-holliday`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar la actividad");
    }

    return response;
  }
}
