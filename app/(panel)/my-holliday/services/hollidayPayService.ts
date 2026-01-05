import { parseCookies } from "nookies";
import { RegisterOptionsHollidayPayRequest } from "./request/registerHollidayPayRequest";
import { RegisterHollidayPayResponse } from "./response/RegisterHollidayPayResponse";

export class HollidayPayService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 1. Enviar OTP al correo
  async sendOtp(email: string): Promise<{ message: string }> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${this.baseUrl}/api/holliday-pay/generate-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      }
    );

    const result = (await response.json()) as { message: string };

    if (!response.ok) {
      throw new Error(result?.message || "Error al enviar el OTP");
    }

    return result;
  }

  // 🔹 2. Registrar medio de pago
  async registerPayment(
    data: RegisterOptionsHollidayPayRequest
  ): Promise<RegisterHollidayPayResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${this.baseUrl}/api/holliday-pay/register-pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as RegisterHollidayPayResponse;

    if (!response.ok) {
      throw new Error(
        result?.message || "Error al registrar el pago de vacaciones"
      );
    }

    return result;
  }
}
