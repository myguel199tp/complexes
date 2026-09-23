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
  audience: AdAudience;
  minOrders: number;
  lapsedDays: number;
  userIds: string[];
  status: AdStatus;
  paymentStatus: AdPaymentStatus;
  currency: string;
  cpm: number;
  targetingSurcharge: number;
  totalAmount: number;
  suspensionReason: string | null;
  creditedImpressions: number;
  creditedAmount: number;
}

/** Un conjunto donde el comercio puede anunciarse. */
export interface AdReachConjunto {
  id: string;
  name: string;
  plan: string;
  apartments: number;
  /** `false` cuando el plan de ese conjunto no admite el formato elegido. */
  eligible: boolean;
}

export interface AdQuote {
  currency: string;
  format: AdFormat;
  impressions: number;
  durationDays: number;
  cpm: number;
  targetingSurcharge: number;
  subtotal: number;
  totalAmount: number;
  reach: {
    eligibleConjuntos: number;
    apartments: number;
    excluded: AdReachConjunto[];
  };
  suggestedDailyCap: number;
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
  byConjunto: {
    conjuntoId: string;
    plan: string;
    impressions: number;
    clicks: number;
  }[];
}

export interface AdPricingConfig {
  currency: string;
  cpmFeedCard: number;
  cpmBanner: number;
  cpmInterstitial: number;
  surchargeGeo: number;
  surchargeAudience: number;
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
  audience?: AdAudience;
  minOrders?: number;
  lapsedDays?: number;
  userIds?: string[];
}

export type QuoteInput = Pick<
  AdCampaignInput,
  "format" | "impressions" | "durationDays" | "conjuntoIds" | "cities" | "audience"
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

/** Los conjuntos suscritos, marcando cuáles no reciben ese formato. */
export function getAdReach(format?: AdFormat) {
  const query = format ? `?format=${format}` : "";
  return comercioFetch<AdReachConjunto[]>(`/comercio/ads/reach${query}`);
}

/** Cotiza sin crear nada. El precio real siempre lo recalcula el servidor. */
export function quoteAd(data: QuoteInput) {
  return comercioFetch<AdQuote>("/comercio/ads/quote", {
    method: "POST",
    body: JSON.stringify(data),
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
