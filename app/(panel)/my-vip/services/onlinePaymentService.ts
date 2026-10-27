import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** ¿Este usuario puede pagar en línea en el conjunto? */
export interface OnlinePaymentStatus {
  enabled: boolean;
  isOwner: boolean;
  /** No hay pasarela conectada: los pagos no mueven dinero real. */
  simulated: boolean;
  reason?: string | null;
  currency?: string;
  fee?: { percent: number; fixed: number; taxRate: number };
  destination?: OnlinePaymentDestination;
}

export interface OnlinePaymentDestination {
  bankName: string;
  accountType: string;
  accountLast4: string;
}

export interface OnlinePaymentAllocation {
  feeId: string;
  concept: string;
  amount: number;
}

/** Desglose: lo del conjunto, la comisión de la plataforma y su IVA. */
export interface OnlinePaymentQuote {
  amount: number;
  feePercent: number;
  feeFixed: number;
  commission: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  allocations: OnlinePaymentAllocation[];
  simulated: boolean;
}

export interface OnlinePayment extends OnlinePaymentQuote {
  id: string;
  status: "AWAITING_OTP" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  destination: OnlinePaymentDestination;
  /** Correo enmascarado al que llegó el código. */
  email: string;
  otpExpiresAt: string | null;
  canResendAt: string | null;
  gatewayReference: string | null;
  paidAt: string | null;
  failureReason: string | null;
  receipts?: {
    feeId: string;
    concept: string;
    amount: number;
    installmentId: string;
    receiptNumber: string | null;
  }[];
}

const base = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/online-payments`;

async function request<T>(
  path: string,
  conjuntoId: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${base()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "No se pudo completar el pago";

    try {
      const body = await response.json();
      if (Array.isArray(body?.message)) {
        message = body.message[0] ?? message;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // el cuerpo no era JSON válido; se mantiene el mensaje por defecto
    }

    throw new Error(message);
  }

  return response.json();
}

export const getOnlinePaymentStatus = (conjuntoId: string) =>
  request<OnlinePaymentStatus>("/status", conjuntoId);

export const quoteOnlinePayment = (conjuntoId: string, feeIds: string[]) =>
  request<OnlinePaymentQuote>("/quote", conjuntoId, {
    method: "POST",
    body: JSON.stringify({ feeIds }),
  });

/** Crea el pago y manda el código al correo. */
export const startOnlinePayment = (conjuntoId: string, feeIds: string[]) =>
  request<OnlinePayment>("", conjuntoId, {
    method: "POST",
    body: JSON.stringify({ feeIds }),
  });

export const resendOnlinePaymentOtp = (conjuntoId: string, id: string) =>
  request<OnlinePayment>(`/${id}/resend-otp`, conjuntoId, { method: "POST" });

export const confirmOnlinePayment = (
  conjuntoId: string,
  id: string,
  otp: string,
) =>
  request<OnlinePayment>(`/${id}/confirm`, conjuntoId, {
    method: "POST",
    body: JSON.stringify({ otp }),
  });

export const cancelOnlinePayment = (conjuntoId: string, id: string) =>
  request<OnlinePayment>(`/${id}/cancel`, conjuntoId, { method: "POST" });
