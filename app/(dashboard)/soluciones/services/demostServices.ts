import { CreateDemonstrationRequest } from "./request/demostrationRequest";
import { DemonstrationResponse } from "./response/demostrationResponse";

export class DataDemsotrationServices {
  async createDemonstration(
    data: CreateDemonstrationRequest,
  ): Promise<DemonstrationResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/demonstrations/demo`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Error creando la demostración");
    }

    return response.json();
  }
}
