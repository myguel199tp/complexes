import { parseCookies } from "nookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class VerificationService {
  static async approvePayment(id: string, conjuntoId: string) {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const res = await fetch(`${BASE_URL}/api/admin-fee/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-conjunto-id": conjuntoId,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }

  // ❌ RECHAZAR
  static async rejectPayment(id: string, reason: string, conjuntoId: string) {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const res = await fetch(`${BASE_URL}/api/admin-fee/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

  // 🆕 CREAR PAGO
  static async createPayment(formData: FormData) {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const res = await fetch(`${BASE_URL}/admin-fee`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // 🔥 importante (NO JSON)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  }
}
