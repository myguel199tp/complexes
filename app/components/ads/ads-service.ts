import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Lo invasivo que es cada formato, de menos a más. Espeja `AdFormat`. */
export type AdFormat = "FEED_CARD" | "BANNER" | "INTERSTITIAL";

/**
 * Dónde se pide publicidad. Los mismos nombres que el móvil y que `AdSlot` del
 * backend, que es quien decide si el plan del conjunto admite ese espacio: en
 * platino las pantallas del conjunto (novedades, actividades, foro) vuelven
 * vacías.
 */
export type AdSlotName =
  | "commerce-list"
  | "order-tracking"
  | "marketplace"
  | "home-feed"
  | "activities"
  | "forum"
  | "locals";

export interface ServedAd {
  id: string;
  comercioId: string;
  comercioName: string | null;
  branchId: string | null;
  title: string;
  body: string | null;
  imageFilename: string | null;
  ctaLabel: string | null;
  ctaTargetId: string | null;
  format: AdFormat;
  sponsored: true;
  /**
   * `false` = el comercio no está suscrito a este conjunto: no se le puede
   * comprar desde aquí y al tocar se abre su ficha, no la tienda.
   */
  shoppable?: boolean;
}

export interface AdServeResponse {
  plan: string;
  ads: ServedAd[];
}

/** La ficha del comercio, para quien no puede comprarle desde la app. */
export interface AdvertiserCard {
  comercioId: string;
  name: string | null;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  branches: {
    id: string;
    name: string;
    address: string;
    neighborhood: string | null;
    cityName: string;
    phone: string | null;
  }[];
}

async function call<T>(path: string, conjuntoId: string, init: RequestInit = {}) {
  const response = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // El backend toma el conjunto de aquí, con la pertenencia comprobada.
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) throw new Error(`Publicidad: ${response.status}`);

  return response.json() as Promise<T>;
}

/**
 * Los anuncios que le tocan a este residente en este espacio.
 *
 * **Esta llamada cobra**: el servidor cuenta la impresión al entregarla. Por
 * eso `AdSlot` la hace una vez por montaje y nunca en un refetch.
 */
export function serveAds(conjuntoId: string, slot: AdSlotName, limit?: number) {
  const params = new URLSearchParams({ slot });
  if (limit) params.set("limit", String(limit));
  return call<AdServeResponse>(`/ads/serve?${params.toString()}`, conjuntoId);
}

/** El toque en el anuncio. No cobra: mide. */
export function registerAdClick(adId: string, conjuntoId: string) {
  return call<{ ok: true }>(`/ads/${adId}/click`, conjuntoId, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getAdvertiser(adId: string, conjuntoId: string) {
  return call<AdvertiserCard>(`/ads/${adId}/advertiser`, conjuntoId);
}
