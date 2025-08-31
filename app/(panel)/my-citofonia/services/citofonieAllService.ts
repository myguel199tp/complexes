import { parseCookies } from "nookies";
import { VisitResponse } from "./response/VisitResponse";

export async function allVisitService(
  conjuntoId: string
): Promise<VisitResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/allvisits/${conjuntoId}`,
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

  const data: VisitResponse[] = await response.json();
  return data;
}
