import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

export async function RemoveUserService(
  userId: string,
  conjuntoId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/${userId}/${conjuntoId}`,
    {
      method: "DELETE",
      // El guard exige el conjunto seleccionado y el backend lo compara con
      // el de la URL.
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  return;
}
