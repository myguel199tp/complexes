// src/services/holliday-pay.service.ts
import { parseCookies } from "nookies";
import { RegisterOptionshollidayPAyRequest } from "./request/registerHollidayPayRequest";

export class HollidayPayService {
  async registerPayment(
    data: RegisterOptionshollidayPAyRequest
  ): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/holliday-pay/register-pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al registrar el pago de vacaciones: ${errorText}`);
    }

    return response;
  }
}
