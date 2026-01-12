// import { parseCookies } from "nookies";

import { parseCookies } from "nookies";

export interface ISimulatePayment {
  amount: number;
  currency: string;
  plan: string;
}

export class SimulatePaymentService {
  async simulatePayment(
    conjuntoId: string,
    data: ISimulatePayment
  ): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/${conjuntoId}/simulate-payment`,
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
  }
}
