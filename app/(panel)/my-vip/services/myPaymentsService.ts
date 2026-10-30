import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Una cuota dentro de un pago, con su recibo de caja. */
export interface MyPaymentItem {
  installmentId: string;
  feeId: string;
  concept: string;
  amount: number;
  receiptNumber: string | null;
  unit: string;
}

/**
 * Un pago tal como se hizo: un pago en línea que saldó tres cuotas es uno
 * solo, con sus tres recibos adentro.
 */
export interface MyPayment {
  id: string;
  kind: "online" | "manual";
  paidAt: string;
  reference: string | null;
  /** Lo que fue a las cuotas. */
  amount: number;
  /** Lo que se pagó: en línea suma la comisión y su IVA. */
  total: number;
  commission: number;
  taxAmount: number;
  currency: string | null;
  simulated: boolean;
  /** El comprobante del pago en línea solo lo baja quien pagó. */
  canDownloadProof: boolean;
  items: MyPaymentItem[];
}

export interface MyPayments {
  payments: MyPayment[];
  totalPaid: number;
}

const API = () => `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`;

async function errorOf(response: Response, fallback: string) {
  try {
    const body = await response.json();
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;
    return new Error(message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function getMyPayments(conjuntoId: string): Promise<MyPayments> {
  const response = await fetchWithAuth(`${API()}/my-payments`, {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await errorOf(response, "No se pudieron cargar tus pagos");
  }

  return response.json();
}

/**
 * Va por blob y no por un enlace directo porque el endpoint exige el header
 * `x-conjunto-id` y el token: un `<a href>` no los lleva.
 */
async function downloadPdf(url: string, conjuntoId: string, filename: string) {
  const response = await fetchWithAuth(url, {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await errorOf(response, "No se pudo descargar el PDF");
  }

  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

/** Recibo de caja de una cuota pagada. */
export const downloadMyReceipt = (item: MyPaymentItem, conjuntoId: string) =>
  downloadPdf(
    `${API()}/receipt/${item.installmentId}/pdf`,
    conjuntoId,
    `${item.receiptNumber ?? "recibo"}.pdf`,
  );

/** Comprobante de un pago en línea: el mismo que llegó al correo. */
export const downloadOnlinePaymentProof = (
  payment: Pick<MyPayment, "id" | "reference">,
  conjuntoId: string,
) =>
  downloadPdf(
    `${API()}/online-payments/${payment.id}/receipt/pdf`,
    conjuntoId,
    `Comprobante-${payment.reference ?? payment.id}.pdf`,
  );
