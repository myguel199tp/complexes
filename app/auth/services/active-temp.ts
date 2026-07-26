export interface ActivateAccountResponse {
  success: boolean;
  message: string;
  /** La sesión queda en cookies httpOnly; los tokens ya no llegan al cliente. */
  authenticated?: boolean;
  roles?: string[];
}

export async function activateTempPassword(
  token: string,
  password: string,
): Promise<ActivateAccountResponse> {
  const response = await fetch(
    `/api/auth/activate-account/${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
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
