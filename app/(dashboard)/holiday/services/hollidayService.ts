// services/hollidayService.ts
import { HollidayResponses } from "./response/holidayResponses";

export interface Filters {
  property?: string;
  minPrice?: string;
  maxPrice?: string;
  country?: string;
  city?: string;
  petsAllowed?: string;
  parking?: string;
  eventsAllowed?: string;
  maxGuests?: string;
  sort?: "highlight" | "recent" | "old";
}

export async function hollidaysService(
  filters: Filters = {}
): Promise<HollidayResponses[]> {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/hollidays/byAllData?${queryParams.toString()}&t=${Date.now()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
