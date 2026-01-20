import { parseCookies } from "nookies";
import { CommonAreaResponse } from "./response/commonAreaResponse";
import { CreateCommonAreaRequest } from "./request/createCommonAreaRequest";

export class DataCommmonAreaServices {
  async addCommmonArea(
    data: CreateCommonAreaRequest,
  ): Promise<CommonAreaResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/common-areas`,
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
      throw new Error("Error creando área común");
    }

    return response.json();
  }

  // 📄 Listar áreas comunes
  async getCommmonArea(conjuntoId: string): Promise<CommonAreaResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({ conjuntoId }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/common-areas?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
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
