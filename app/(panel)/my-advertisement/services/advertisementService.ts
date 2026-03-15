import { AdvertisementResponses } from "./response/advertisementResponse";

interface Filters {
  names?: string;
  contact?: string;
  typeService?: string;
}

export async function advertisementsService(
  conjuntoId: string,
  filters: Filters = {},
): Promise<AdvertisementResponses[]> {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  const url = `/api/advertisements?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  const data: AdvertisementResponses[] = await response.json();
  return data;
}
