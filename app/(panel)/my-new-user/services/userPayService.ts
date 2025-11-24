import { parseCookies } from "nookies";

export async function PayUserService(data: FormData): Promise<Response> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token en el almacenamiento");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`,
    {
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}
