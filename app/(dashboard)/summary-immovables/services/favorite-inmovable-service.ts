import { parseCookies } from "nookies";
import { ICreateFavoriteInmovable } from "./response/favoriteInmovableResponse";

export class FavoriteInmovableServices {
  async favoriteInmovableServices(
    data: ICreateFavoriteInmovable
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
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    return response;
  }
}
