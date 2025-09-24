import { parseCookies } from "nookies";
import { CertificationResponse } from "./response/certificationResponse";

export async function allCertificationService(
  conjuntoId: string
): Promise<CertificationResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/record/allRecord/${conjuntoId}`,
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

  const data: CertificationResponse[] = await response.json();
  return data;
}
