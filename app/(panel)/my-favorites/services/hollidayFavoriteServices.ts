import { ICreateFavorite } from "../../holiday/services/response/favoriteResponse";
import { backendError } from "@/app/helpers/backendError";

export async function HolidayFavoriteService(
  iduser: string,
): Promise<ICreateFavorite[]> {
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/favorites/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: ICreateFavorite[] = await response.json();
  return data;
}
