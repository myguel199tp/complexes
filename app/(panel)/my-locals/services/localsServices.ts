import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateLocalRequest } from "./request/localsRequest";
import { CreateLocalResponse } from "./response/localsResponse";
import { backendMessage } from "@/app/helpers/backendError";

export class DataLocalsServices {
  async addLoals(data: CreateLocalRequest): Promise<CreateLocalResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/locals`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": data.conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(backendMessage(errorText, "Error al agregar el local"));
    }

    return response.json();
  }

  async allLocals(conjuntoId: string): Promise<CreateLocalResponse[]> {
    const query = new URLSearchParams({ conjuntoId }).toString();

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/locals?${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        backendMessage(errorText, "Error al obtener los locales"),
      );
    }

    return response.json();
  }
}
