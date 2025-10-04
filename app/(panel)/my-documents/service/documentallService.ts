import { parseCookies } from "nookies";
import { DocumentResponse } from "./response/documentResponse";

export async function allDocumentService(
  conjuntoId: string
): Promise<DocumentResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/record/allRecord/public/${conjuntoId}`,
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

  const data: DocumentResponse[] = await response.json();
  return data;
}
