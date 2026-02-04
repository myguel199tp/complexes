import { parseCookies } from "nookies";
import { CreateLocalRequest } from "./request/localsRequest";
import { CreateLocalResponse } from "./response/localsResponse";

export class DataLocalsServices {
  async addLoals(data: CreateLocalRequest): Promise<CreateLocalResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/locals`,
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
      const errorText = await response.text();
      throw new Error(`Error al agregar el foro: ${errorText}`);
    }

    return response.json();
  }

  async allLocals(conjuntoId?: number): Promise<CreateLocalResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = conjuntoId ? `?conjuntoId=${conjuntoId}` : "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/locals${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener los locales: ${errorText}`);
    }

    return response.json();
  }
}
