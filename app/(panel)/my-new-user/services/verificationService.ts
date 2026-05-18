import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class VerificationService {
  static async approvePayment(id: string, conjuntoId: string) {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee/${id}/approve`, {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }

  static async rejectPayment(id: string, reason: string, conjuntoId: string) {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }

  static async createPayment(formData: FormData) {
    const res = await fetchWithAuth(`${BASE_URL}/admin-fee`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }
}
