import { ICreateFavoriteInmovable } from "./response/favoriteInmovableResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class FavoriteInmovableServices {
  async favoriteInmovableServices(
    data: ICreateFavoriteInmovable,
    conjuntoId: string,
  ): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorite-inmovable`,
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
