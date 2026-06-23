import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function approveAdminFeeService(
  adminFeeId: string,
  conjuntoId: string,
) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/${adminFeeId}/approve`,
    {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
