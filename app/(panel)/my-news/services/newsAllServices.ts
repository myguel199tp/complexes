import { parseCookies } from "nookies";
import { NewsResponse } from "./response/newsResponse";

export async function allNewsService(
  conjuntoId: string
): Promise<NewsResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/new-admin/allNews/${conjuntoId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
