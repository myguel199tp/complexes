import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** GET /api/vacation-payments/mercadopago */
export interface MercadoPagoAccountStatus {
  /** `mercadopago`: las reservas se cobran por Mercado Pago. */
  cobroEnLinea: "simulated" | "mercadopago";
  vinculada: boolean;
  /** El id del usuario en Mercado Pago. */
  cuentaMercadoPago: string | null;
  /** Vinculada con credenciales de prueba. */
  modoPrueba: boolean;
  venceEl: string | null;
  /** La autorización venció y no se pudo renovar. */
  volverAVincular: boolean;
}

const base = () => `${process.env.NEXT_PUBLIC_API_URL}/api/vacation-payments/mercadopago`;

async function parse<T>(response: Response, fallback: string): Promise<T> {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || fallback);
  }

  return result as T;
}

export async function getMercadoPagoAccount(): Promise<MercadoPagoAccountStatus> {
  const response = await fetchWithAuth(base(), { method: "GET" });
  return parse(response, "No pudimos consultar tu cuenta de Mercado Pago");
}

/** La URL de Mercado Pago donde el anfitrión autoriza la vinculación. */
export async function connectMercadoPago(): Promise<{ url: string }> {
  const response = await fetchWithAuth(`${base()}/connect`, { method: "POST" });
  return parse(response, "No pudimos iniciar la vinculación con Mercado Pago");
}

export async function disconnectMercadoPago(): Promise<{ vinculada: false }> {
  const response = await fetchWithAuth(base(), { method: "DELETE" });
  return parse(response, "No pudimos desvincular la cuenta de Mercado Pago");
}
