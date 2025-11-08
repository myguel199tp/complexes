import { VerifyOtpRequest } from "./request/verifyOpt";
import { LoginResponse } from "./response/login";

export async function VerifyOtp(
  data: VerifyOtpRequest
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error en OTP");
  }

  return response.json();
}
