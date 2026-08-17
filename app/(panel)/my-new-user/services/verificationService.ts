import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Una cuota esperando verificación, tal como la devuelve
 * `GET /admin-fee/pending-verification`.
 */
export interface PendingVerificationFee {
  id: string;
  apartment?: string | null;
  tower?: string | null;
  user?: string | null;
  amount: number | string;
  /** Abonos ya verificados sobre esta cuota. */
  paidAmount?: number;
  /** Saldo antes de aplicar el abono que se está revisando. */
  outstanding?: number;
  /** Lo que el residente dice haber consignado en este abono. */
  reportedAmount?: number;
  installmentId?: string | null;
  valuepay?: string | null;
  description?: string;
  customName?: string | null;
  type: string;
  dueDate: string;
  paidAt?: string | null;
  file?: string | null;
  paymentReference?: string | null;
  status: string;
}

export class VerificationService {
  /**
   * Aprueba el abono.
   *
   * `amount` es lo que la administración verificó contra el extracto, que no
   * siempre coincide con lo que el residente reportó. Sin él la cuota se
   * marcaba pagada por el total, así que un abono parcial la saldaba completa.
   */
  static async approvePaymentWithAmount(
    id: string,
    conjuntoId: string,
    amount: number,
  ) {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

  /**
   * Bandeja de verificación: lo que los residentes ya pagaron y el conjunto
   * todavía no revisa.
   *
   * El endpoint existía en el backend desde hace tiempo pero no lo consumía
   * nadie: la administración tenía que abrir residente por residente para
   * encontrar los comprobantes que le habían llegado.
   */
  static async getPendingVerification(
    conjuntoId: string,
  ): Promise<PendingVerificationFee[]> {
    const res = await fetchWithAuth(
      `${BASE_URL}/api/admin-fee/pending-verification`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.json();
  }

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

  // La URL iba sin el prefijo `/api`, a diferencia del resto del módulo.
  static async createPayment(formData: FormData) {
    const res = await fetchWithAuth(`${BASE_URL}/api/admin-fee`, {
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
