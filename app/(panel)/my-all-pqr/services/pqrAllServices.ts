import { parseCookies } from "nookies";
import { AllPqrResponse } from "./response/AllPqrResponse";

export async function AllPqrService(
  conjuntoId: string
): Promise<AllPqrResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/${conjuntoId}`;

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

  const data: AllPqrResponse[] = await response.json();
  return data;
}
