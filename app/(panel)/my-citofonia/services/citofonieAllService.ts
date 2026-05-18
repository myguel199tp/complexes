import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { VisitResponse } from "./response/VisitResponse";

export async function allVisitService(
  conjuntoId: string,
): Promise<VisitResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/allvisits`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: VisitResponse[] = await response.json();
  return data;
}
