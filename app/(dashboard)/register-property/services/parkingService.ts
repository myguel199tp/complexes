import { parkingResponses } from "./response/parkingResponse";

export async function parkingService(): Promise<parkingResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/parking`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: parkingResponses[] = await response.json();
  return data;
}
