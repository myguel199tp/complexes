import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";
import { comercioFetch } from "@/app/comercio/_lib/comercio-api";

/**
 * Cobros de la plataforma: lo que un conjunto o un comercio le paga a la
 * plataforma (plan, paquetes, acceso B2B, suscripciones, cotizaciones).
 *
 * Con Bre-B, pedir pagar ya no activa en el acto: responde
 * `{ status: "awaiting_payment", charge }` con a dónde pagar. Se paga desde la
 * app del banco, se sube el comprobante y soporte lo verifica; al aprobarlo se
 * activa lo pagado. En simulado (desarrollo) todo sigue activándose solo.
 */

export type PlatformChargeConcept =
  | "conjunto_plan"
  | "content_package"
  | "b2b_access"
  | "b2c_subscription"
  | "home_quote_plan"
  | "ad_campaign"
  | "b2b_ad";

export type PlatformChargeStatus =
  | "awaiting_payment"
  | "in_review"
  | "paid"
  | "rejected"
  | "cancelled"
  | "expired";

export interface PlatformCharge {
  id: string;
  concept: PlatformChargeConcept;
  description: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: PlatformChargeStatus;
  /** Lo que se escribe en la descripción del pago Bre-B. */
  reference: string;
  hasProof: boolean;
  transactionId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  expiresAt: string | null;
  reportedAt: string | null;
  paidAt: string | null;
  instructions: {
    method: "bre_b";
    key: string;
    keyType: string;
    holderName: string;
    qrUrl: string | null;
  } | null;
}

export interface AwaitingPayment {
  status: "awaiting_payment";
  message: string;
  charge: PlatformCharge;
}

/** ¿La respuesta de un "pagar" es un cobro esperando el pago (Bre-B)? */
export function isAwaitingPayment(value: unknown): value is AwaitingPayment {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { status?: unknown }).status === "awaiting_payment" &&
    !!(value as { charge?: unknown }).charge
  );
}

export interface ReportInput {
  file: File;
  transactionId?: string;
  note?: string;
}

/** Lo mismo para los dos lados que pagan; cambia la sesión y la ruta. */
export interface PlatformChargesApi {
  /** Para separar las cachés del conjunto y del comercio. */
  scope: string;
  list(concept?: PlatformChargeConcept): Promise<PlatformCharge[]>;
  report(id: string, input: ReportInput): Promise<PlatformCharge>;
  cancel(id: string): Promise<PlatformCharge>;
  openProof(id: string): Promise<void>;
}

const toForm = (input: ReportInput) => {
  const form = new FormData();
  form.append("file", input.file);
  if (input.transactionId?.trim()) {
    form.append("transactionId", input.transactionId.trim());
  }
  if (input.note?.trim()) form.append("note", input.note.trim());
  return form;
};

const openBlob = async (response: Response) => {
  const url = URL.createObjectURL(await response.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/** La administración del conjunto (plan del conjunto, paquetes). */
export function conjuntoChargesApi(conjuntoId: string): PlatformChargesApi {
  const base = `${process.env.NEXT_PUBLIC_API_URL}/api/platform-charges/conjunto`;
  const headers = { "x-conjunto-id": conjuntoId };

  const json = async <T>(response: Response): Promise<T> => {
    if (!response.ok) throw await backendError(response);
    return response.json();
  };

  return {
    scope: `conjunto:${conjuntoId}`,
    list: async (concept) =>
      json(
        await fetchWithAuth(`${base}${concept ? `?concept=${concept}` : ""}`, {
          headers,
        }),
      ),
    report: async (id, input) =>
      json(
        await fetchWithAuth(`${base}/${id}/report`, {
          method: "POST",
          headers,
          body: toForm(input),
        }),
      ),
    cancel: async (id) =>
      json(
        await fetchWithAuth(`${base}/${id}/cancel`, { method: "POST", headers }),
      ),
    openProof: async (id) => {
      const response = await fetchWithAuth(`${base}/${id}/proof`, { headers });
      if (!response.ok) throw await backendError(response);
      await openBlob(response);
    },
  };
}

/** El comercio (acceso B2B, suscripciones B2C, canal de cotizaciones). */
export const comercioChargesApi: PlatformChargesApi = {
  scope: "comercio",
  list: (concept) =>
    comercioFetch<PlatformCharge[]>(
      `/platform-charges/comercio${concept ? `?concept=${concept}` : ""}`,
    ),
  report: (id, input) =>
    comercioFetch<PlatformCharge>(`/platform-charges/comercio/${id}/report`, {
      method: "POST",
      body: toForm(input),
    }),
  cancel: (id) =>
    comercioFetch<PlatformCharge>(`/platform-charges/comercio/${id}/cancel`, {
      method: "POST",
    }),
  openProof: async (id) => {
    const response = await fetch(
      `/api/comercio/proxy/api/platform-charges/comercio/${id}/proof`,
      { credentials: "same-origin" },
    );
    if (!response.ok) throw new Error("No se pudo abrir el comprobante");
    await openBlob(response);
  },
};
