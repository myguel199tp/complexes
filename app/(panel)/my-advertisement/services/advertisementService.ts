import { parseCookies } from "nookies";
import { AdvertisementResponses } from "./response/advertisementResponse";

interface Filters {
  names?: string;
  contact?: string;
  typeService?: string;
}

export async function advertisementsService(
  conjuntoId: string,
  filters: Filters = {}
): Promise<AdvertisementResponses[]> {
  const queryParams = new URLSearchParams();
  const cookies = parseCookies();
  const token = cookies.accessToken;
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/seller-profile/byAllData/${conjuntoId}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data: AdvertisementResponses[] = await response.json();
  return data;
}
