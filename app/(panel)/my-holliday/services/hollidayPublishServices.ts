import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class HollidayServices {
  async publishHolliday(conjuntoId: string, id: string): Promise<Response> {
    if (!conjuntoId) {
      console.warn("⚠️ conjuntoId está vacío o undefined");
    }

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/${id}/publish`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al publicar el holiday");
    }

    return response;
  }
}
