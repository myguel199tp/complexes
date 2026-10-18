import { comercioFetch } from "../../_lib/comercio-api";
import type { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";

/**
 * Destacados B2B: aparecer primero ante las administraciones que buscan
 * proveedores. Producto aparte de la publicidad B2C para residentes
 * (`/comercio/ads`), con su propia tarifa: mes fijo por categoría y ciudad.
 */

export type B2bAdScope = "city" | "coverage" | "national";
export type B2bAdSignal = "open_demand" | "no_provider" | "contract_ending";
export type B2bAdStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "ended"
  | "suspended";

export interface B2bPlacement {
  id: string;
  category: B2bServiceCategory;
  scope: B2bAdScope;
  cities: string[];
  title: string;
  body: string | null;
  minApartments: number | null;
  maxApartments: number | null;
  signals: B2bAdSignal[];
  months: number;
  startsAt: string;
  endsAt: string;
  currency: string;
  monthlyPrice: number;
  totalAmount: number;
  status: B2bAdStatus;
  paymentStatus: "pending" | "paid";
  impressions: number;
  clicks: number;
  suspensionReason: string | null;
}

export interface B2bAdQuote {
  currency: string;
  categoryLabel: string;
  scope: B2bAdScope;
  cities: string[];
  soldOutCities: string[];
  months: number;
  monthlyPrice: number;
  totalAmount: number;
  startsAt: string;
  endsAt: string;
  available: boolean;
  notes: string[];
}

export interface B2bAdStats {
  impressions: number;
  clicks: number;
  conjuntosReached: number;
  quotesAfter: number;
  contractsAfter: number;
  windows: { quoteDays: number; contractDays: number };
}

export interface B2bAdPricing {
  currency: string;
  monthlyPerCity: number;
  monthlyNational: number;
  maxMonths: number;
  maxPerCategoryCity: number;
}

export interface B2bAdQuoteInput {
  category: B2bServiceCategory;
  scope: B2bAdScope;
  city?: string;
  months: number;
  startsAt?: string;
}

export interface B2bAdInput extends B2bAdQuoteInput {
  title: string;
  body?: string;
  minApartments?: number;
  maxApartments?: number;
  signals?: B2bAdSignal[];
}

/** Lo que el panel necesita del perfil para armar el destacado. */
export interface B2bAdProfile {
  serviceCategories?: B2bServiceCategory[] | null;
  /** Vacío o nulo = cobertura nacional. */
  coverageCities?: string[] | null;
}

const base = "/comercio/b2b-ads";

export const getB2bAdPricing = () => comercioFetch<B2bAdPricing>(`${base}/pricing`);

export const getB2bAdProfile = () =>
  comercioFetch<B2bAdProfile>("/comercio-auth/profile");

export const getB2bPlacements = () => comercioFetch<B2bPlacement[]>(base);

export const quoteB2bAd = (data: B2bAdQuoteInput) =>
  comercioFetch<B2bAdQuote>(`${base}/quote`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createB2bPlacement = (data: B2bAdInput) =>
  comercioFetch<B2bPlacement>(base, { method: "POST", body: JSON.stringify(data) });

export const getB2bPlacementStats = (id: string) =>
  comercioFetch<B2bAdStats>(`${base}/${id}/stats`);

const action = (id: string, verb: "pay" | "pause" | "resume") =>
  comercioFetch<B2bPlacement>(`${base}/${id}/${verb}`, { method: "POST" });

export const payB2bPlacement = (id: string) => action(id, "pay");
export const pauseB2bPlacement = (id: string) => action(id, "pause");
export const resumeB2bPlacement = (id: string) => action(id, "resume");

export const deleteB2bPlacement = (id: string) =>
  comercioFetch<{ id: string; deleted: boolean }>(`${base}/${id}`, {
    method: "DELETE",
  });
