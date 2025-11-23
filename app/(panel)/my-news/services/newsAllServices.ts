import { parseCookies } from "nookies";
import { NewsResponse } from "./response/newsResponse";

export async function allNewsService(
  conjuntoId: string
): Promise<NewsResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/allNews/${conjuntoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    // Leer la respuesta como texto para mostrar el mensaje exacto del error
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  // Aquí asumimos que la respuesta sí es JSON válido
  return await response.json();
}
