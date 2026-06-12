import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminByConjuntoResponse } from "./response/adminByConjuntoResponse";

export async function adminByConjuntoService(
  conjuntoId: string,
): Promise<AdminByConjuntoResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/admin/by-conjunto`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
