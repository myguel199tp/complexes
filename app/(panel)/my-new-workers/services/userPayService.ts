import { CreateAdminFeeRequest } from "./request/adminFee";
import { AdminFeeResponse } from "./response/userFeeResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendMessage } from "@/app/helpers/backendError";

export async function PayUserService(
  data: CreateAdminFeeRequest,
): Promise<AdminFeeResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`,
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
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
