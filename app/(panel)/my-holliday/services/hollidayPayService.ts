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

  /**
   * Deja la cuenta como la que recibe los pagos del inmueble. El registro solo
   * la guardaba: sin esto, desde el web el inmueble nunca quedaba con cuenta.
   */
  async assignToHolliday(
    conjuntoId: string,
    hollidayId: string,
    payId: number,
  ): Promise<void> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/api/hollidays/${hollidayId}/pay/${payId}`,
      {
        method: "PATCH",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(
        result?.message ||
          "La cuenta quedó registrada, pero no se pudo asignar al inmueble",
      );
    }
  }
}
