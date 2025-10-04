import { parseCookies } from "nookies";
import { CreateAdminFeeRequest } from "./request/adminFee";

export async function PayUserService(
  data: CreateAdminFeeRequest
): Promise<void> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!token) {
    throw new Error("No se encontró token en el almacenamiento");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data), // 👈 importante
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error en la solicitud: ${response.status} - ${response.statusText}`
    );
  }

  return;
}
