import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { RegisterOptionsHollidayPayRequest } from "./request/registerHollidayPayRequest";
import { RegisterHollidayPayResponse } from "./response/RegisterHollidayPayResponse";

export class HollidayPayService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async sendOtp(email: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/api/holliday-pay/generate-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      },
    );

    const result = (await response.json()) as { message: string };

    if (!response.ok) {
      throw new Error(result?.message || "Error al enviar el OTP");
    }

    return result;
  }

  async registerPayment(
    data: RegisterOptionsHollidayPayRequest,
  ): Promise<RegisterHollidayPayResponse> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/api/holliday-pay/register-pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    const result = (await response.json()) as RegisterHollidayPayResponse;

    if (!response.ok) {
      throw new Error(
        result?.message || "Error al registrar el pago de vacaciones",
      );
    }

    return result;
  }
}
