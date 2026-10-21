import { comercioFetch } from "../../_lib/comercio-api";

/** Lo invasivo que es cada formato, de menos a más. Espeja `AdFormat`. */
export type AdFormat = "FEED_CARD" | "BANNER" | "INTERSTITIAL";

export type AdAudience = "ALL" | "BUYERS" | "NON_BUYERS" | "LAPSED" | "LIST";

export type AdStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "RUNNING"
  | "PAUSED"
  | "EXHAUSTED"
  | "ENDED"
  | "SUSPENDED";

export type AdPaymentStatus = "PENDING" | "PAID" | "CREDITED";

export interface AdCampaign {
  id: string;
  title: string;
  body: string | null;
  imageFilename: string | null;
  ctaLabel: string | null;
  ctaTargetId: string | null;
  branchId: string | null;
  format: AdFormat;
  startsAt: string;
  endsAt: string;
  impressionsPurchased: number;
  impressionsServed: number;
  clicks: number;
  dailyImpressionCap: number | null;
  conjuntoIds: string[];
  cities: string[];
  /** Compró llegar también a conjuntos del área sin suscripción. */
  extendedReach: boolean;
  audience: AdAudience;
  minOrders: number;
  lapsedDays: number;
  userIds: string[];
  status: AdStatus;
  paymentStatus: AdPaymentStatus;
  currency: string;
  cpm: number;
  targetingSurcharge: number;
  /** Precio del paquete, sin IVA. */
  totalAmount: number;
  /** Parte del total que se pagó con saldo a favor. */
  creditApplied: number;
  /** IVA (0.19 = 19%): cotizado en el borrador, fijado al pagar. */
  taxRate: number;
  /** IVA sobre lo que quedó después del saldo. 0 hasta pagar. */
  taxAmount: number;
  /** Lo cobrado: total − saldo + IVA. 0 hasta pagar. */
  amountCharged: number;
  suspensionReason: string | null;
  /** Lo no servido al suspenderse o vencer, devuelto como saldo. */
  creditedImpressions: number;
  creditedAmount: number;
}

/** Saldo a favor: se descuenta solo al pagar el próximo anuncio. */
export interface AdCredit {
  currency: string;
  balance: number;
}

/** Un conjunto donde el comercio puede anunciarse. */
export interface AdReachConjunto {
  id: string;
  name: string;
  plan: string;
  apartments: number;
  /** `false` cuando el plan de ese conjunto no admite el formato elegido. */
  eligible: boolean;
  /** `false` = del área, sin suscripción: solo llega con alcance extendido. */
  subscribed: boolean;
}

export interface AdQuote {
  currency: string;
  format: AdFormat;
  impressions: number;
  durationDays: number;
  cpm: number;
  /** Todos los recargos juntos, como fracción. */
  targetingSurcharge: number;
  /**
   * La parte de `targetingSurcharge` que es por alcance extendido: la tarifa
   * aplicada solo sobre `extendedReachShare`.
   */
  extendedReachSurcharge: number;
  /** Fracción del público que está en conjuntos sin suscripción (0 a 1). */
  extendedReachShare: number;
  subtotal: number;
  /** Sin IVA. */
  totalAmount: number;
  /** IVA del país del comercio (0.19 = 19%). */
  taxRate: number;
  /** IVA sobre el total sin saldo; con saldo baja. */
  taxAmount: number;
  /** Lo que pagaría sin saldo. */
  totalWithTax: number;
  reach: {
    eligibleConjuntos: number;
    apartments: number;
    /** De los anteriores, los del área sin suscripción. */
    outsideConjuntos: number;
    outsideApartments: number;
    excluded: AdReachConjunto[];
  };
  suggestedDailyCap: number;
  /** Veces por día que caben en el público (una por apartamento). 0 = sin dato. */
  maxDailyImpressions: number;
  notes: string[];
}

export interface AdStats {
  id: string;
  status: AdStatus;
  impressionsPurchased: number;
  impressionsServed: number;
  remaining: number;
  clicks: number;
  ctr: number;
  costPerClick: number | null;
  currency: string;
  extendedReach: boolean;
  /** Servidas en conjuntos sin suscripción. */
  impressionsOutsideSubscriptions: number;
  byConjunto: {
    conjuntoId: string;
    plan: string;
    impressions: number;
    clicks: number;
    outsideImpressions: number;
  }[];
}

export interface AdPricingConfig {
  currency: string;
  cpmFeedCard: number;
  cpmBanner: number;
  cpmInterstitial: number;
  surchargeGeo: number;
  surchargeAudience: number;
  /** Recargo por llegar a conjuntos sin suscripción (0.5 = 50%). */
  surchargeExtendedReach: number;
  minImpressions: number;
  maxImpressions: number;
  maxDurationDays: number;
  minChargeAmount: number;
}

export interface AdCampaignInput {
  title: string;
  body?: string;
  imageFilename?: string;
  ctaLabel?: string;
  ctaTargetId?: string;
  branchId?: string;
  format: AdFormat;
  startsAt: string;
  durationDays: number;
  impressions: number;
  dailyImpressionCap?: number;
  conjuntoIds?: string[];
  cities?: string[];
  extendedReach?: boolean;
  audience?: AdAudience;
  minOrders?: number;
  lapsedDays?: number;
  userIds?: string[];
}

export type QuoteInput = Pick<
  AdCampaignInput,
  | "format"
  | "impressions"
  | "durationDays"
  | "conjuntoIds"
  | "cities"
  | "audience"
  | "branchId"
  | "extendedReach"
>;

export function getAds() {
  return comercioFetch<AdCampaign[]>("/comercio/ads");
}

export function getAd(id: string) {
  return comercioFetch<AdCampaign>(`/comercio/ads/${id}`);
}

export function getAdStats(id: string) {
  return comercioFetch<AdStats>(`/comercio/ads/${id}/stats`);
}

export function getAdPricing() {
  return comercioFetch<AdPricingConfig>("/comercio/ads/pricing");
}

export function getAdCredit() {
  return comercioFetch<AdCredit>("/comercio/ads/credit");
}

/**
 * Los conjuntos suscritos, marcando cuáles no reciben ese formato. Con
 * sucursal, solo los que suscribió esa sucursal.
 */
export function getAdReach(format?: AdFormat, branchId?: string) {
  const params = new URLSearchParams();
  if (format) params.set("format", format);
  if (branchId) params.set("branchId", branchId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return comercioFetch<AdReachConjunto[]>(`/comercio/ads/reach${query}`);
}

/** Cotiza sin crear nada. El precio real siempre lo recalcula el servidor. */
export function quoteAd(data: QuoteInput) {
  return comercioFetch<AdQuote>("/comercio/ads/quote", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Sube la imagen de un banner o pantalla completa. Devuelve la ruta que va en
 * `imageFilename` al crear el anuncio.
 */
export function uploadAdImage(file: File) {
  const body = new FormData();
  body.append("image", file);
  return comercioFetch<{ imageFilename: string }>("/comercio/ads/image", {
    method: "POST",
    body,
  });
}

export function createAd(data: AdCampaignInput) {
  return comercioFetch<AdCampaign & { quote: AdQuote }>("/comercio/ads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAd(id: string, data: Partial<AdCampaignInput>) {
  return comercioFetch<AdCampaign>(`/comercio/ads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function payAd(id: string) {
  return comercioFetch<AdCampaign>(`/comercio/ads/${id}/pay`, {
    method: "POST",
  });
}

export function pauseAd(id: string) {
  return comercioFetch<AdCampaign>(`/comercio/ads/${id}/pause`, {
    method: "POST",
  });
}

export function resumeAd(id: string) {
  return comercioFetch<AdCampaign>(`/comercio/ads/${id}/resume`, {
    method: "POST",
  });
}

export function deleteAd(id: string) {
  return comercioFetch<{ id: string; deleted: boolean }>(
    `/comercio/ads/${id}`,
    { method: "DELETE" },
  );
}
