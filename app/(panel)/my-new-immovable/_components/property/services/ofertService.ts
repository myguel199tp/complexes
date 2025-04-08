import { ofertResponses } from "./response/ofertResponse";

export async function ofertService(): Promise<ofertResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ofert`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: ofertResponses[] = await response.json();
  return data;
}
