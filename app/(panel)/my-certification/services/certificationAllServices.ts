import { CertificationResponse } from "./response/certificationResponse";

export async function allCertificationService(
  conjuntoId: string,
): Promise<CertificationResponse[]> {
  const response = await fetch("/api/documents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include", // importante
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
