import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { ICreateFavorite } from "@/app/(dashboard)/holiday/services/response/favoriteResponse";

export async function HolidayFavoriteService(): Promise<ICreateFavorite[]> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const iduser = String(storedUserId);
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/favorites/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: ICreateFavorite[] = await response.json();
  return data;
}
