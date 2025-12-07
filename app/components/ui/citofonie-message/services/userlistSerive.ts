import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { parseCookies } from "nookies";

export async function allUserListService(
  conjuntoId: string
): Promise<EnsembleResponse[]> {
  const cookies = parseCookies();

  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token en el almacenamiento");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/conjunto/${conjuntoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
