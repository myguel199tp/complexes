import { parseCookies } from "nookies";
import { CreateCommonAreaRequest } from "./request/CreateCommonAreaRequest";
import { CommonAreaResponse } from "./response/commonAreaResponse";

export class DataCommmonAreaServices {
  // ➕ Crear área común
  async addCommmonArea(
    data: CreateCommonAreaRequest
  ): Promise<CommonAreaResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("conjuntoId", data.conjuntoId);

    if (data.description) {
      formData.append("description", data.description);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/common-areas`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
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
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo áreas comunes");
    }

    return response.json();
  }
}
