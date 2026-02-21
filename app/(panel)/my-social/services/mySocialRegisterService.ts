import { SocialResponse } from "./response/socialResponse";

export async function allReservationService(
  conjuntoId: string,
): Promise<SocialResponse[]> {
  const response = await fetch(`/api/reserver`, {
    method: "GET",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: SocialResponse[] = await response.json();
  return data;
}
