import { AddResponses } from "./response/addResponse";

export async function addInfoService(
  conjuntoId: string,
  storedUserId: string,
): Promise<AddResponses[]> {
  const url = `/api/market/propio/${storedUserId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AddResponses[] = await response.json();
  return data;
}
