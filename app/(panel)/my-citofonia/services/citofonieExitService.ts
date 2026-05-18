import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class CitofonieExitService {
  async exitVisit(conjuntoId: string, id: string) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetchWithAuth(`${BASE_URL}/api/visit/exit/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al finalizar visita");
    }

    return response.json();
  }
}
