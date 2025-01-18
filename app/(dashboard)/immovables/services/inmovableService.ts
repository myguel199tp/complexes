import { InmovableResponses } from "./response/inmovableResponses";

export async function immovableService(): Promise<InmovableResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/sales/byAllData`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: InmovableResponses[] = await response.json();
  return data;
}
