/**
 * Cobro del arriendo de una celda visto desde el link de pago.
 *
 * No pasa por `fetchWithAuth`, igual que el cobro del visitante: el externo no
 * tiene cuenta en la app. Lo que autentica cada llamada es el token del link,
 * largo y aleatorio, que le llega por correo cada mes.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface PublicRentalCharge {
  conjunto: string;
  spotCode?: string | null;
  tenantName?: string | null;
  /** CONJUNTO: celda del conjunto. RESIDENT: celda de otro residente. */
  payee: "CONJUNTO" | "RESIDENT";
  period: string;
  dueDate: string;
  /** Lo que le llega al conjunto o al dueño. */
  canon: number;
  feePercent: number;
  feeAmount: number;
  taxAmount: number;
  /** Lo que paga el arrendatario. */
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  paidAt?: string | null;
  /** La pasarela real todavía no está conectada. */
  simulated: boolean;
}

export interface RentalReceipt {
  message: string;
  total: number;
  period: string;
  spotCode?: string | null;
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

export async function getPublicRentalCharge(
  token: string,
): Promise<PublicRentalCharge> {
  const response = await fetch(`${API_URL}/api/parking-rental-pay/${token}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Este cobro no existe"));
  }

  return response.json();
}

export async function payPublicRentalCharge(
  token: string,
): Promise<RentalReceipt> {
  const response = await fetch(
    `${API_URL}/api/parking-rental-pay/${token}/pay`,
    { method: "POST", cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await readError(response, "No se pudo registrar el pago"));
  }

  return response.json();
}
