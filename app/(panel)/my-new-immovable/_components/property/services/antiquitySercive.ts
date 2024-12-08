import { antiquityResponses } from "./response/antiquityResponse";

export async function antiquityService(): Promise<antiquityResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/antiquity`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: antiquityResponses[] = await response.json();
  return data;
}
