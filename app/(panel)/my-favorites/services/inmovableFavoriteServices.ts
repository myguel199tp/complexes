import { InmovableResponses } from "@/app/(dashboard)/immovables/services/response/inmovableResponses";
import { backendError } from "@/app/helpers/backendError";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Con sesión: el backend solo devuelve los favoritos del propio usuario. */
export async function InmovableFavoriteService(
  iduser: string,
): Promise<InmovableResponses[]> {
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/favorite-inmovable/byuser?${queryParams.toString()}`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: InmovableResponses[] = await response.json();
  return data;
}
