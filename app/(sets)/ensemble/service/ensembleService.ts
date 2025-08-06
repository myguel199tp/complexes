import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { EnsembleResponse } from "./response/ensembleResponse";
import { parseCookies } from "nookies";

// Puedes eliminar Filters si ya no necesitas otros filtros dinámicos.
export async function EnsembleService(): Promise<EnsembleResponse[]> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!storedUserId) {
    throw new Error("No se encontró el ID del usuario en el token.");
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/user/${storedUserId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: EnsembleResponse[] = await response.json();
  return data;
}
