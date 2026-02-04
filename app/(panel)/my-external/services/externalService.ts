import { parseCookies } from "nookies";
import { ExternalRequest } from "./request/externaRequest";
import { ExternalResponse } from "./response/externalResponse";

export class DataExternalServices {
  async addExternal(data: ExternalRequest): Promise<ExternalResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;
    const holliday = "fewfewf";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${holliday}`,
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
      throw new Error("Error");
    }

    return response.json();
  }

  async getExternal(
    conjuntoId: string,
    status?: string,
  ): Promise<ExternalResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const query = new URLSearchParams({
      conjuntoId,
      ...(status && { status }),
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error");
    }

    return response.json();
  }
}
