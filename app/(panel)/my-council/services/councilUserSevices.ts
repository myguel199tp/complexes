import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

interface councilUserResponse {
  id: string;
  name: string;
  apartment: string;
}

export async function addCouncilUserService(
  conjuntoId: string,
): Promise<councilUserResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/council-members`,
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

  const data: councilUserResponse[] = await response.json();
  return data;
}
