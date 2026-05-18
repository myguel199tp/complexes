import { ICreateHabeas } from "./response/habeas";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class HabeasServices {
  async createHabeas(data: ICreateHabeas): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/habeas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    return response;
  }
}
