import { HollidayResponses } from "./response/holidayResponses";

interface Filters {
  property?: string;
  minPrice?: string;
  maxPrice?: string;
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
  }/api/hollidays/byAllData?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: HollidayResponses[] = await response.json();
  return data;
}
