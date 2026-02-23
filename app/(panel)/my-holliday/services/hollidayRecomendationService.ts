import { CreateRecommendationsRequest } from "./request/recomendationHolidayResponse";

export class DataRecomendationServices {
  async addRecomendation(
    conjuntoId: string,
    data: CreateRecommendationsRequest,
  ): Promise<Response> {
    const response = await fetch(`/api/vacation/recomendation/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al agregar recomendación");
    }

    return response;
  }
}
