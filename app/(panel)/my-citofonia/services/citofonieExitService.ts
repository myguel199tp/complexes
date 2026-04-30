import { parseCookies } from "nookies";

export class CitofonieExitService {
  async exitVisit(conjuntoId: string, id: string) {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${BASE_URL}/api/visit/exit/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
