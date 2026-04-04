import { parseCookies } from "nookies";
import { AdminFeePayment, CreateAdminFeePaymentDto } from "./admin-fee-payment";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = (conjuntoId: string) => {
  const cookies = parseCookies();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cookies.accessToken}`,
    "x-conjunto-id": conjuntoId,
  };
};

interface GenerateFeesResponse {
  message: string;
  generatedFees: number;
}

export class FeePaymentsService {
  static async createPayment(
    data: CreateAdminFeePaymentDto,
    conjuntoId: string,
  ): Promise<AdminFeePayment> {
    const res = await fetch(`${BASE_URL}/api/admin-fee-payment`, {
      method: "POST",
      headers: getHeaders(conjuntoId),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async getPayments(conjuntoId: string): Promise<AdminFeePayment[]> {
    const res = await fetch(`${BASE_URL}/api/admin-fee-payment`, {
      method: "GET",
      headers: getHeaders(conjuntoId),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  static async generateFees(
    configId: string,
    conjuntoId: string,
  ): Promise<GenerateFeesResponse> {
    const res = await fetch(
      `${BASE_URL}/api/admin-fee-payment/${configId}/generate-fees`,
      {
        method: "POST",
        headers: getHeaders(conjuntoId),
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }
}
