import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AddResponses } from "./response/addResponse";

export async function addInfoService(
  conjuntoId: string,
): Promise<AddResponses[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile`,
    {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AddResponses[] = await response.json();
  return data;
}
