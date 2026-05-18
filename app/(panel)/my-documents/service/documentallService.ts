import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { DocumentResponse } from "./response/documentResponse";

export async function allDocumentService(
  conjuntoId: string,
): Promise<DocumentResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/record/allRecord/public`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: DocumentResponse[] = await response.json();
  return data;
}
