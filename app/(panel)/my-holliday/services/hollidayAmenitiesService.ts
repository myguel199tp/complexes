import { amenitiesResponses } from "./response/amenitiesHollidayResponse";

export async function amenitieService(): Promise<amenitiesResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/amanitie`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: amenitiesResponses[] = await response.json();
  return data;
}
