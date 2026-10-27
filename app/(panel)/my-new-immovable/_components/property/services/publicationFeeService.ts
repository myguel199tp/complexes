import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Cuánto cuesta la siguiente publicación, según el plan del conjunto. */
export interface PublicationQuote {
  plan: "basic" | "gold" | "platinum" | string;
  /** Entra en un cupo gratis del plan. */
  free: boolean;
  /** Publicaciones gratis vigentes a la vez que da el plan. */
  freeSlots: number;
  freeUsed: number;
  freeRemaining: number;
  /** Precio por publicación del plan, sin IVA. */
  unitPrice: number;
  /** Lo que se cobra esta vez, sin IVA. */
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  requiresPayment: boolean;
  /** No hay pasarela conectada: el pago no mueve dinero real. */
  simulated: boolean;
  /** La tarifa de cada plan; solo viene en la consulta, no en el 402. */
  plans?: { plan: string; freeSlots: number; price: number; total: number }[];
}

/**
 * El backend respondió 402: la publicación ya no es gratis y no se aceptó
 * pagar. Trae la cotización vigente para mostrarla.
 */
export class PublicationPaymentRequired extends Error {
  constructor(
    message: string,
    readonly quote: PublicationQuote,
  ) {
    super(message);
  }
}

export const PLAN_LABEL: Record<string, string> = {
  basic: "Básico",
  gold: "Oro",
  platinum: "Platino",
};

export const formatMoney = (value: number, currency = "COP") =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export async function getPublicationQuote(
  conjuntoId: string,
): Promise<PublicationQuote> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/sales/publication-quote`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw new Error("No se pudo consultar el costo de publicar");
  }

  return response.json();
}
