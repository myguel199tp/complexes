import { VisitResponse } from "./response/VisitResponse";

export async function allVisitService(
  conjuntoId: string,
): Promise<VisitResponse[]> {
  const response = await fetch(`/api/cito`, {
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: VisitResponse[] = await response.json();
  return data;
}
