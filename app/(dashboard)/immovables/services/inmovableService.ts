import { InmovableResponses } from "./response/inmovableResponses";

export interface Filters {
  country?: string;
  city?: string;
  ofert?: string;
  stratum?: string;
  room?: string;
  restroom?: string;
  age?: string;
  parking?: string;
  property?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  sort?: "highlight" | "recent" | "old";
}

interface ImmovableServiceOptions {
  filters?: Filters;
  page?: number;
  limit?: number;
}

export async function ImmovableService({
  filters = {},
  page = 1,
  limit = 24,
}: ImmovableServiceOptions): Promise<InmovableResponses[]> {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });

  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  queryParams.append("t", Date.now().toString());

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/sales/byAllData?${queryParams.toString()}`;

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
