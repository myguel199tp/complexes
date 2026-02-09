// services/habeas.service.ts
import { parseCookies } from "nookies";
import { ICreateHabeas } from "./response/habeas";

export class HabeasServices {
  async createHabeas(data: ICreateHabeas): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/habeas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    return response;
  }
}
