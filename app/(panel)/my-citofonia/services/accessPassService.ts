import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import {
  AccessPassResponse,
  ValidatedAccessResponse,
} from "./response/AccessPassResponse";
import { GuestFeeDueError } from "./stayChargeService";

const BASE = () => `${process.env.NEXT_PUBLIC_API_URL}/api/access-pass`;

const headers = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return new Error(body?.message || fallback);
}

export interface CreateAccessPassPayload {
  visitorName: string;
  visitorDocument?: string;
  plaque?: string;
  visitType?: string;
  type?: "VISIT" | "RECURRING";
  apartment?: string;
  validFrom?: string;
  validTo: string;
  maxUses?: number;
  notes?: string;
}

export async function createAccessPass(
  conjuntoId: string,
  payload: CreateAccessPassPayload,
): Promise<AccessPassResponse> {
  const response = await fetchWithAuth(BASE(), {
    method: "POST",
    headers: headers(conjuntoId),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw await readError(response, "No se pudo crear el pase");

  return response.json();
}

export async function myAccessPasses(
  conjuntoId: string,
): Promise<AccessPassResponse[]> {
  const response = await fetchWithAuth(`${BASE()}/mine`, {
    headers: headers(conjuntoId),
  });

  if (!response.ok) throw await readError(response, "No se pudieron cargar los pases");

  return response.json();
}

/**
 * Un solo endpoint para los tres tipos de código —pase de residente, huésped
 * vacacional y domicilio—. Antes cada uno tenía su propia pantalla y el portero
 * tenía que saber de antemano qué le estaban mostrando.
 */
export async function validateAccessCode(
  conjuntoId: string,
  code: string,
): Promise<ValidatedAccessResponse> {
  const response = await fetchWithAuth(`${BASE()}/validate`, {
    method: "POST",
    headers: headers(conjuntoId),
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    // 402: el código es válido, pero el huésped externo todavía no ha pagado
    // su acceso. No es un rechazo: es el momento de cobrar.
    if (response.status === 402) {
      const body = await response.json().catch(() => null);

      throw new GuestFeeDueError({
        message: body?.message || "El huésped debe pagar su acceso",
        externalStayId: body?.externalStayId,
        chargeId: body?.chargeId,
        amountDue: body?.amountDue ?? 0,
      });
    }

    throw await readError(response, "Acceso denegado");
  }

  return response.json();
}

export async function revokeAccessPass(
  conjuntoId: string,
  id: string,
  reason: string,
): Promise<AccessPassResponse> {
  const response = await fetchWithAuth(`${BASE()}/${id}/revoke`, {
    method: "PATCH",
    headers: headers(conjuntoId),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) throw await readError(response, "No se pudo revocar el pase");

  return response.json();
}

/**
 * El QR lo dibuja el backend. Se descarga como blob porque la petición necesita
 * cabeceras de sesión y de conjunto, y un `<img src>` no puede enviarlas.
 */
export async function fetchAccessPassQr(
  conjuntoId: string,
  id: string,
): Promise<Blob> {
  const response = await fetchWithAuth(`${BASE()}/${id}/qr`, {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) throw await readError(response, "No se pudo generar el QR");

  return response.blob();
}
