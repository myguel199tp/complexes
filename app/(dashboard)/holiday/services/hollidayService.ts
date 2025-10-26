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
  smokingAllowed?: string;
  sort?: "highlight" | "recent" | "old";
}

interface HollidaysServiceOptions {
  filters?: Filters;
  page?: number;
  limit?: number;
}

export async function HollidaysService({
  filters = {},
  page = 1,
  limit = 24,
}: HollidaysServiceOptions): Promise<HollidayResponses[]> {
  const queryParams = new URLSearchParams();

  // 🔹 Aplica filtros
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });

  // 🔹 Añade paginación
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  // 🔹 Evita cache agregando timestamp
  queryParams.append("t", Date.now().toString());

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/hollidays/byAllData?${queryParams.toString()}`;

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
