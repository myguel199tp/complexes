import { parseCookies } from "nookies";
import { CreateRecommendationsRequest } from "./request/recomendationHolidayResponse";

export class DataRecomendationServices {
  async addRecomendation(
    data: CreateRecommendationsRequest
  ): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations-holliday/multiple`,
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

    if (!response.ok) {
      throw new Error("Error al agregar recomendación");
    }

    return response;
  }
}
