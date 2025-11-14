import { parseCookies } from "nookies";
import { CreateAdminPayFeeRequest } from "./request/adminFeePayRequest";

export async function PayFeeUserService(data: CreateAdminPayFeeRequest) {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  if (!token) throw new Error("No se encontró token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  // ✅ Devuelve el JSON o algo verificable
  return await response.json();
}
