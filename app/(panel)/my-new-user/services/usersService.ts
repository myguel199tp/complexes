import { parseCookies } from "nookies";
import { UsersResponse } from "./response/usersResponse";

export async function allUserService(
  conjuntoId: string
): Promise<UsersResponse[]> {
  // Extraemos el conjuntoId del payload
  console.log("en el service", conjuntoId);
  const cookies = parseCookies();

  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token en el almacenamiento");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/users?conjuntoId=${conjuntoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Mandamos el JWT
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
