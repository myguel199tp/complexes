import { parseCookies } from "nookies";

export async function RemoveUserService(
  userId: string,
  conjuntoId: string
): Promise<void> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token en el almacenamiento");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/${userId}/${conjuntoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText}`
    );
  }

  return;
}
