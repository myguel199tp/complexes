import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { comercioFetch } from "@/app/comercio/_lib/comercio-api";
import type { AwaitingPayment } from "@/app/components/platform-charge/platform-charge-api";

/**
 * Paquetes de consultas de Lary y de mensajes de WhatsApp. El cupo gratis del
 * mes lo trae el plan; lo que pasa de ahí sale de los paquetes comprados.
 */
export type UsageCreditModule = "ai" | "whatsapp" | "comercio_whatsapp";

export interface UsageCreditPackage {
  id: string;
  name: string;
  credits: number;
  used: number;
  remaining: number;
  endsAt: string;
}

export interface UsageCreditOffer {
  id: string;
  name: string;
  credits: number;
  durationDays: number;
  /** Sin IVA. */
  price: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
}

/** GET …/usage-credits/:module */
export interface UsageCreditsSummary {
  module: UsageCreditModule;
  /** "consultas de Lary", "mensajes de WhatsApp"… */
  unit: string;
  freeLimit: number;
  freeUsed: number;
  freeRemaining: number;
  /** Cuándo vuelve el cupo gratis. */
  resetsAt: string;
  creditsRemaining: number;
  packages: UsageCreditPackage[];
  offers: UsageCreditOffer[];
  /** Sin pasarela conectada el pago no mueve dinero real. */
  simulated: boolean;
}

export type PurchaseResult = UsageCreditsSummary | AwaitingPayment;

/** Cómo leer y comprar: del conjunto (con su cabecera) o del comercio. */
export interface UsageCreditsApi {
  key: unknown[];
  get: () => Promise<UsageCreditsSummary>;
  purchase: (packageId: string) => Promise<PurchaseResult>;
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  const message = Array.isArray(body?.message)
    ? body.message.join(", ")
    : body?.message;
  return new Error(message || fallback);
}

export function conjuntoUsageCreditsApi(
  module: "ai" | "whatsapp",
  conjuntoId: string,
): UsageCreditsApi {
  const base = `${process.env.NEXT_PUBLIC_API_URL}/api/usage-credits/${module}`;
  const headers = { "x-conjunto-id": conjuntoId };

  return {
    key: ["usage-credits", module, conjuntoId],
    get: async () => {
      const response = await fetchWithAuth(base, { headers });
      if (!response.ok) {
        throw await readError(response, "No se pudo consultar el cupo");
      }
      return response.json();
    },
    purchase: async (packageId) => {
      const response = await fetchWithAuth(
        `${base}/packages/${packageId}/purchase`,
        { method: "POST", headers },
      );
      if (!response.ok) {
        throw await readError(response, "No se pudo comprar el paquete");
      }
      return response.json();
    },
  };
}

export const comercioWhatsappCreditsApi: UsageCreditsApi = {
  key: ["usage-credits", "comercio_whatsapp"],
  get: () => comercioFetch<UsageCreditsSummary>("/comercio/usage-credits/whatsapp"),
  purchase: (packageId) =>
    comercioFetch<PurchaseResult>(
      `/comercio/usage-credits/whatsapp/packages/${packageId}/purchase`,
      { method: "POST" },
    ),
};

/** "1 de diciembre", en hora de Colombia. */
export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  });
