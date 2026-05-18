import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function RemoveUserService(
  userId: string,
  conjuntoId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/${userId}/${conjuntoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText}`,
    );
  }

  return;
}
