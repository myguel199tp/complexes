import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CertificationResponse } from "./response/certificationResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function allCertificationService(
  conjuntoId: string,
): Promise<CertificationResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/record/allRecord`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
