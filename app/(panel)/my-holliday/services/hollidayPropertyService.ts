import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

import { propertyHollidayResponse } from "./response/propertyHollidayResponse";

export async function hollidayPropertyService(): Promise<
  propertyHollidayResponse[]
> {
  // El controller exige JwtAuthGuard: la petición debe pasar por /api/proxy
  // para que el Bearer se adjunte desde la cookie httpOnly.
  const response = await fetchWithAuth(
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
