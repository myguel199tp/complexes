import { stratumResponses } from "./response/stratumResponse";

export async function stratumService(): Promise<stratumResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stratum`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: stratumResponses[] = await response.json();
  return data;
}
