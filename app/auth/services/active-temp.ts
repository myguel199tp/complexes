export interface ActivateAccountResponse {
  success: boolean;
  message: string;
}

export async function activateTempPassword(
  token: string,
  password: string,
): Promise<ActivateAccountResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/activate-account/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        password,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    throw new Error(err.message ?? "Error activando cuenta");
  }

  return response.json();
}
