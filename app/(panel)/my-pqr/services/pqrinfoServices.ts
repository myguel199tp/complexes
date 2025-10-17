import { parseCookies } from "nookies";
import { PqrResponse } from "./response/pqrResponse";

export async function AllPqrInfoService(
  userId: string,
  conjuntoId: string
): Promise<PqrResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/${conjuntoId}/${userId}`;

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

  const data: PqrResponse[] = await response.json();
  return data;
}
