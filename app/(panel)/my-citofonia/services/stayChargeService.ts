import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/external-stay-access`;

const headers = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return new Error(body?.message || fallback);
}

export interface StayCharge {
  chargeId: string;
  externalStayId: string;
  amount: number;
  status: "PENDING" | "REVIEW" | "PAID" | "FREE";
  method: "ONLINE" | "CASH" | null;
  /** Lo que codifica el QR. Nulo cuando ya no hay nada que cobrar. */
  checkoutUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  guestUserId: string | null;
}

/**
 * El acceso del huésped externo está pendiente de pago.
 *
 * Se distingue del error genérico porque no es una falla: es el flujo normal de
 * la reja. La pantalla lo usa para abrir el cobro en vez de mostrar el cartel
 * rojo de "acceso denegado", que le diría al celador que el código está malo
 * cuando en realidad está perfecto y solo falta pagar.
 */
export class GuestFeeDueError extends Error {
  readonly externalStayId: string;
  readonly chargeId: string;
  readonly amountDue: number;

  constructor(payload: {
    message: string;
    externalStayId: string;
    chargeId: string;
    amountDue: number;
  }) {
    super(payload.message);
    this.name = "GuestFeeDueError";
    this.externalStayId = payload.externalStayId;
    this.chargeId = payload.chargeId;
    this.amountDue = payload.amountDue;
  }
}

/** Estado del cobro. Se consulta en bucle mientras el modal está abierto. */
export async function getStayCharge(
  conjuntoId: string,
  externalStayId: string,
): Promise<StayCharge> {
  const response = await fetchWithAuth(`${BASE()}/${externalStayId}`, {
    headers: headers(conjuntoId),
  });

  if (!response.ok) throw await readError(response, "No se pudo leer el cobro");

  return response.json();
}

/** Abre el cobro y emite el token del QR. Repetirlo no mueve el monto. */
export async function startStayCheckout(
  conjuntoId: string,
  externalStayId: string,
): Promise<StayCharge> {
  const response = await fetchWithAuth(`${BASE()}/${externalStayId}/checkout`, {
    method: "POST",
    headers: headers(conjuntoId),
  });

  if (!response.ok)
    throw await readError(response, "No se pudo generar el cobro");

  return response.json();
}

/**
 * PNG del QR. Va por el mismo camino autenticado que las fotos de portería: un
 * `<img src>` no puede mandar cabeceras, así que se baja el binario y se expone
 * como object URL.
 */
export async function getStayQrBlob(
  conjuntoId: string,
  externalStayId: string,
): Promise<Blob> {
  const response = await fetchWithAuth(`${BASE()}/${externalStayId}/qr`, {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) throw new Error("No se pudo generar el QR de pago");

  return response.blob();
}

/**
 * Efectivo recibido en la reja. El soporte es obligatorio: es la única prueba
 * de que esa plata existe y de quién la tiene mientras administración cuadra
 * caja.
 */
export async function payStayCash(
  conjuntoId: string,
  externalStayId: string,
  file: File,
): Promise<StayCharge> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithAuth(`${BASE()}/${externalStayId}/cash`, {
    method: "POST",
    body: formData,
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok)
    throw await readError(response, "No se pudo registrar el efectivo");

  return response.json();
}

/** Exonerar es perdonar plata: el backend solo se lo permite a administración. */
export async function waiveStayCharge(
  conjuntoId: string,
  externalStayId: string,
  reason: string,
): Promise<StayCharge> {
  const response = await fetchWithAuth(`${BASE()}/${externalStayId}/waive`, {
    method: "POST",
    headers: headers(conjuntoId),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok)
    throw await readError(response, "No se pudo exonerar el cobro");

  return response.json();
}
