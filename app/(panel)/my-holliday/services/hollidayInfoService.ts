import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { HollidayInfoResponses } from "./response/holllidayInfoResponse";
import { backendError } from "@/app/helpers/backendError";

/**
 * Los inmuebles del anfitrión con sesión. El backend ya no acepta un `iduser`
 * cualquiera sin sesión: lo toma del token. Se sigue mandando por si quien
 * consulta es la empresa.
 */
export async function holllidayInfoService(
  iduser: string,
): Promise<HollidayInfoResponses[]> {
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/hollidays/byuser?${queryParams.toString()}`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: HollidayInfoResponses[] = await response.json();
  return data;
}
