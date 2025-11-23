// src/app/(panel)/my-holliday/services/hollidayPayService.ts
import { parseCookies } from "nookies";
import { RegisterOptionsHollidayPayRequest } from "./request/registerHollidayPayRequest";

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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Error al enviar el OTP");
    }

    return result; // Ej: { message: 'OTP generado correctamente' }
  }

  // 🔹 2. Registrar el medio de pago (verificando OTP)
  async registerPayment(
    data: RegisterOptionsHollidayPayRequest
  ): Promise<{ message: string; data: any }> {
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

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message || "Error al registrar el pago de vacaciones"
      );
    }

    return result; // Ej: { message: 'Medio de pago registrado correctamente', data: {...} }
  }
}
