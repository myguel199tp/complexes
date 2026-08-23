/**
 * Cobro de parqueadero visto desde el celular del visitante.
 *
 * Es lo único de la app que no pasa por `fetchWithAuth`: el visitante es un
 * tercero que entra una vez y no tiene cuenta ni sesión. Lo que autentica cada
 * llamada es el token del QR —de un solo uso, con vencimiento corto y emitido
 * por portería—, así que va directo al backend sin el proxy de sesión.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface PublicCheckout {
  conjunto: string;
  plaque?: string | null;
  entryTime?: string | null;
  durationMinutes: number;
  amount: number;
  paymentStatus: string;
  expiresAt?: string | null;
  /** La pasarela real todavía no está conectada. */
  simulated: boolean;
}

export interface CheckoutReceipt {
  message: string;
  amount: number;
  plaque?: string | null;
  paidAt: string;
  simulated: boolean;
}

async function readError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicCheckout(
  token: string,
): Promise<PublicCheckout> {
  const response = await fetch(
    `${API_URL}/api/visit/parking/checkout/${token}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      await readError(response, "Este cobro no existe o ya venció"),
    );
  }

  return response.json();
}

export async function payPublicCheckout(
  token: string,
): Promise<CheckoutReceipt> {
  const response = await fetch(
    `${API_URL}/api/visit/parking/checkout/${token}/pay`,
    { method: "POST", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await readError(response, "No se pudo registrar el pago"));
  }

  return response.json();
}
