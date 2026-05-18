import { ICreateFavorite } from "./response/favoriteResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class FavoriteServices {
  async favoriteServices(
    data: ICreateFavorite,
    conjuntoId: string,
  ): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    return response;
  }
}
