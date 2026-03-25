import { AllPqrResponse } from "./response/AllPqrResponse";

export async function AllPqrService(
  conjuntoId: string,
): Promise<AllPqrResponse[]> {
  const url = `api/qr`;

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

  const data: AllPqrResponse[] = await response.json();
  return data;
}
