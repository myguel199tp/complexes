import { parseCookies } from "nookies";
import { CreateProviderRequest } from "./request/createproviderRequest";
import { ProviderResponse } from "./response/providerResponse";

export class DataProviderServices {
  // ➕ Crear proveedor
  async addProvider(data: CreateProviderRequest): Promise<ProviderResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/providers`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error creando proveedor");
    }

    return response.json();
  }

  // 📄 Listar proveedores
  async getProviders(conjuntoId: string): Promise<ProviderResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({ conjuntoId }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/providers?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
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
