import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

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
    throw await backendError(response);
  }

  const data: councilUserResponse[] = await response.json();
  return data;
}
