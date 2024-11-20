import { restroomResponses } from "./response/restroomResponse";

export async function restroomService(): Promise<restroomResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restroom`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: restroomResponses[] = await response.json();
  return data;
}
