import { HollidayResponses } from "./response/holidayResponses";

export async function hollidaysService(): Promise<HollidayResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hollidays/byAllData`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: HollidayResponses[] = await response.json();
  return data;
}
