import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Lo que cuesta subir un video (MP4) a una publicación de inmueble en el
 * conjunto: Platino incluido; Básico y Oro pagan una vez por publicación. El
 * enlace de YouTube o Vimeo no se cobra.
 */
export interface ListingVideoQuote {
  included: boolean;
  /** Sin IVA. */
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  /** Sin pasarela conectada el pago no mueve dinero real. */
  simulated: boolean;
}

export async function getListingVideoQuote(
  conjuntoId: string,
): Promise<ListingVideoQuote> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listing-video/quote`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw new Error("No se pudo consultar el precio del video");
  }

  return response.json();
}

/**
 * El backend respondió 402: la publicación trae un video subido que el plan
 * no incluye y no se aceptó pagarlo. Trae el precio para mostrarlo.
 */
export class VideoPaymentRequired extends Error {
  constructor(
    message: string,
    readonly video: ListingVideoQuote,
  ) {
    super(message);
  }
}

export const formatCop = (value: number, currency = "COP") =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
