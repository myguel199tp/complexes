import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdvertisementResponses } from "./response/advertisementResponse";

interface Filters {
  names?: string;
  contact?: string;
  typeService?: string;
  sort?: "highlight" | "recent" | "old";
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

  const queryString = queryParams.toString();

  const url = queryString
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile/byAllData?${queryString}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile/byAllData`;

  console.log(url);

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo anuncios");
  }

  return await response.json();
}
