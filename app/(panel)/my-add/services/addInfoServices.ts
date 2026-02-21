import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { AddResponses } from "./response/addResponse";

export async function addInfoService(
  conjuntoId: string,
): Promise<AddResponses[]> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  if (!storedUserId) {
    throw new Error("No se encontró el userId");
  }

  const url = `/api/market/propio/${storedUserId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AddResponses[] = await response.json();
  return data;
}
