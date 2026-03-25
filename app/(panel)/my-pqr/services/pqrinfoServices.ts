import { PqrResponse } from "./response/pqrResponse";

export async function AllPqrInfoService(
  userId: string,
  conjuntoId: string,
): Promise<PqrResponse[]> {
  const url = `/api/qr/${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: PqrResponse[] = await response.json();
  return data;
}
