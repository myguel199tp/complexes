import { propertyHollidayResponse } from "./response/propertyHollidayResponse";

export async function hollidayPropertyService(): Promise<
  propertyHollidayResponse[]
> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/property-holiday`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: propertyHollidayResponse[] = await response.json();
  return data;
}
