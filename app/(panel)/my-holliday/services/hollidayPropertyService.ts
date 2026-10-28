import { propertyHollidayResponse } from "./response/propertyHollidayResponse";
import { backendError } from "@/app/helpers/backendError";

export async function hollidayPropertyService(): Promise<
  propertyHollidayResponse[]
> {
  // El GET es público: lo usa también el registro de un conjunto nuevo
  // (/registers/complex), donde todavía no hay sesión. Por eso no pasa por
  // /api/proxy, que sin cookies responde SESSION_EXPIRED.
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/property-holiday`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: propertyHollidayResponse[] = await response.json();
  return data;
}
