import { CommonAreaResponse } from "./response/commonAreaResponse";
import { CreateCommonAreaRequest } from "./request/createCommonAreaRequest";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataCommmonAreaServices {
  async addCommmonArea(
    conjuntoId: string,
    data: CreateCommonAreaRequest,
  ): Promise<CommonAreaResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/common-areas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error creando área común");
    }

    return response.json();
  }

  async getCommmonArea(conjuntoId: string): Promise<CommonAreaResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/common-areas`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo áreas comunes");
    }

    return response.json();
  }
}
