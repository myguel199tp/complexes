import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ofertResponses } from "./response/ofertResponse";
import { backendError } from "@/app/helpers/backendError";

// /api/ofert exige sesión (JwtAuthGuard): debe ir por el proxy, que pone el Bearer
export async function ofertService(): Promise<ofertResponses[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ofert`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: ofertResponses[] = await response.json();
  return data;
}
