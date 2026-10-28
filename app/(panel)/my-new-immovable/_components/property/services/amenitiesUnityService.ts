import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { amenitiesUnityResponse } from "./response/amenitiesUnityResponse";
import { backendError } from "@/app/helpers/backendError";

// /api/amanitie-resident exige sesión (JwtAuthGuard): debe ir por el proxy
export async function amenitiesUnityService(): Promise<
  amenitiesUnityResponse[]
> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/amanitie-resident`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: amenitiesUnityResponse[] = await response.json();
  return data;
}
