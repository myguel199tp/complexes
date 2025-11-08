export interface ActivateTempPasswordRequest {
  userId: string;
  newPassword: string;
}

export interface ActivateTempPasswordResponse {
  ok: boolean;
  message?: string;
}

export async function activateTempPassword(
  data: ActivateTempPasswordRequest
): Promise<ActivateTempPasswordResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/activate-temp-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? "Error activando contraseña temporal");
  }

  return response.json();
}
