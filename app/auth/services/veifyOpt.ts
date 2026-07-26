import { VerifyOtpRequest } from "./request/verifyOpt";
import { LoginResponse } from "./response/login";

/** Route handler propio: deja la sesión en cookies httpOnly. */
export async function VerifyOtp(
  data: VerifyOtpRequest,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error en OTP");
  }

  return response.json();
}
