import { parseCookies } from "nookies";
import { ICreateFavorite } from "./response/favoriteResponse";

export class FavoriteServices {
  async favoriteServices(data: ICreateFavorite): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`,
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
