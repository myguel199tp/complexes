import { roomResponses } from "./response/roomResponse";

export async function roomService(): Promise<roomResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: roomResponses[] = await response.json();
  return data;
}
