import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateRecommendationsRequest } from "./request/recomendationHolidayResponse";
import { backendError } from "@/app/helpers/backendError";

export class DataRecomendationServices {
  async addRecomendation(
    conjuntoId: string,
    data: CreateRecommendationsRequest,
  ): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations-holliday/multiple`,
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

    if (!response.ok) {
      throw await backendError(response, "Error al agregar recomendación");
    }

    return response;
  }
}
