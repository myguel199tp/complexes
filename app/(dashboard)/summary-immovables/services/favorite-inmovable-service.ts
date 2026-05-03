import { parseCookies } from "nookies";
import { ICreateFavoriteInmovable } from "./response/favoriteInmovableResponse";

export class FavoriteInmovableServices {
  async favoriteInmovableServices(
    data: ICreateFavoriteInmovable,
    conjuntoId: string,
  ): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorite-inmovable`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    return response;
  }
}
