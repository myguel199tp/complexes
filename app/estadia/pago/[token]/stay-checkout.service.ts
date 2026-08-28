/**
 * Cobro de acceso visto desde el celular del huésped.
 *
 * Igual que el cobro de parqueadero, no pasa por `fetchWithAuth`: quien abre
 * esta pantalla llegó por Airbnb y todavía no tiene cuenta en la plataforma —de
 * hecho la cuenta se le crea *por* pagar aquí—. Lo que autentica cada llamada
 * es el token del QR: aleatorio, con vencimiento corto y emitido por portería.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface PublicStayCheckout {
  conjunto: string;
  guestName: string;
  plataforma: string | null;
  entrada: string;
  salida: string;
  amount: number;
  status: "PENDING" | "REVIEW" | "PAID" | "FREE";
  expiresAt?: string | null;
  /** La pasarela real todavía no está conectada. */
  simulated: boolean;
}

export interface StayCheckoutReceipt {
  success: boolean;
  status: string;
  amount: number;
  message: string;
  /**
   * Las credenciales del huésped. Solo vienen en esta respuesta, una vez: es su
   * acceso a la app durante la estadía.
   */
  cuenta: {
    email: string;
    tempPassword: string | null;
    apartamento: string | null;
    torre: string | null;
    desde: string;
    hasta: string;
  } | null;
}

async function readError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicStayCheckout(
  token: string,
): Promise<PublicStayCheckout> {
  const response = await fetch(
    `${API_URL}/api/external-stay-access/checkout/${token}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      await readError(response, "Este cobro no existe o ya venció"),
    );
  }

  return response.json();
}

export async function payPublicStayCheckout(
  token: string,
): Promise<StayCheckoutReceipt> {
  const response = await fetch(
    `${API_URL}/api/external-stay-access/checkout/${token}/pay`,
    { method: "POST", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await readError(response, "No se pudo registrar el pago"));
  }

  return response.json();
}
