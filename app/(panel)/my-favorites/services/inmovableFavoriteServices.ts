import { InmovableResponses } from "@/app/(dashboard)/immovables/services/response/inmovableResponses";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";

export async function InmovableFavoriteService(): Promise<
  InmovableResponses[]
> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const iduser = String(storedUserId);
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/favorite-inmovable/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: InmovableResponses[] = await response.json();
  return data;
}
