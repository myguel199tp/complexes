import { typeVisitResponses } from "./response/typevisitResponse";

export async function typeVisitService(): Promise<typeVisitResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/type-visit`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: typeVisitResponses[] = await response.json();
  return data;
}
