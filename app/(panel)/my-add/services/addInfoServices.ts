import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { AddResponses } from "./response/addResponse";

export async function addInfoService(): Promise<AddResponses[]> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  if (!storedUserId) {
    throw new Error("No se encontró el userId");
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile/${storedUserId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AddResponses[] = await response.json();
  return data;
}
