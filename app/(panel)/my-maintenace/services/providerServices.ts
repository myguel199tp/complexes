import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateProviderRequest } from "./request/createproviderRequest";
import { ProviderResponse } from "./response/providerResponse";

export class DataProviderServices {
  async addProvider(
    conjuntoId: string,
    data: CreateProviderRequest,
  ): Promise<ProviderResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/providers`,
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
      throw new Error("Error creando proveedor");
    }

    return response.json();
  }

  async getProviders(conjuntoId: string): Promise<ProviderResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/providers`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo proveedores");
    }

    return response.json();
  }
}
