import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { CreateAdminPayFeeRequest } from "./request/adminFeePayRequest";

export async function PayFeeUserService(data: CreateAdminPayFeeRequest) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
