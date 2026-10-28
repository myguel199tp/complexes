import { CreateDemonstrationRequest } from "./request/demostrationRequest";
import { DemonstrationResponse } from "./response/demostrationResponse";
import { backendError } from "@/app/helpers/backendError";

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
      throw await backendError(response, "Error creando la demostración");
    }

    return response.json();
  }
}
