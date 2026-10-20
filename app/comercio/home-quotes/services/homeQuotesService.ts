import { comercioFetch } from "../../_lib/comercio-api";

/**
 * Canal de cotizaciones B2C: obras que se cotizan dentro del apartamento
 * (pisos, cocinas, carpintería…). Va aparte de la tienda: sin carrito, sin
 * domicilios y sin la regla de 40 km; llega por ciudades de cobertura.
 */

export type HomeTrade =
  | "pisos_baldosas"
  | "cocinas"
  | "carpinteria"
  | "pintura"
  | "plomeria"
  | "electricidad"
  | "drywall"
  | "vidrios"
  | "cerrajeria"
  | "aire_acondicionado"
  | "otro";

export type HomeQuoteStatus =
  | "requested"
  | "visit_proposed"
  | "visit_scheduled"
  | "quoted"
  | "accepted"
  | "completed"
  | "confirmed"
  | "declined"
  | "rejected"
  | "lost"
  | "cancelled";

export interface HomeQuoteProfile {
  comercioId: string;
  enabled: boolean;
  trades: HomeTrade[];
  coverageCities: string[];
  national: boolean;
  headline: string | null;
  description: string | null;
  portfolioImages: string[];
}

export interface HomeQuotePayment {
  id: string;
  reference: string;
  cities: string[];
  national: boolean;
  months: number;
  amount: number;
  taxAmount: number;
  total: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  superseded: boolean;
  simulated: boolean;
}

export interface HomeQuotePlanStatus {
  active: boolean;
  national: boolean;
  cities: string[];
  expiresAt: string | null;
  daysRemaining: number;
  payments: HomeQuotePayment[];
}

export interface HomeQuoteChannel {
  profile: HomeQuoteProfile;
  exists: boolean;
  fallbackDescription: string | null;
  tradeLabels: Record<HomeTrade, string>;
  limits: { maxTrades: number; maxMonths: number; maxPortfolioImages: number };
  plan: HomeQuotePlanStatus;
}

export interface HomeQuotePlanQuote {
  currency: string;
  months: number;
  national: boolean;
  cityPrices: { city: string; key: string; conjuntos: number; monthlyPrice: number }[];
  emptyCities: string[];
  monthlyPrice: number;
  subtotal: number;
  creditApplied: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  startsAt: string;
  endsAt: string;
  renewal: boolean;
  replacesCurrent: boolean;
  available: boolean;
  notes: string[];
}

export interface HomeQuoteItem {
  description: string;
  amount: number;
}

export interface PassCode {
  code: string;
  status: string;
  validTo: string;
  qr: string;
}

export interface ComercioHomeQuote {
  id: string;
  status: HomeQuoteStatus;
  visitAt: string | null;
  visitorName: string | null;
  visitorDocument: string | null;
  items: HomeQuoteItem[];
  amount: number | null;
  advanceAmount: number | null;
  startDate: string | null;
  workDays: number | null;
  validUntil: string | null;
  notes: string | null;
  quotedAt: string | null;
  expired: boolean;
  acceptedAt: string | null;
  advancePaidAt: string | null;
  balancePaidAt: string | null;
  completedAt: string | null;
  confirmedAt: string | null;
  rating: number | null;
  review: string | null;
  closedReason: string | null;
  updatedAt: string;
  crew: { name: string; document: string | null }[];
  request: {
    id: string;
    number: string;
    trade: HomeTrade;
    tradeLabel: string;
    title: string;
    description: string;
    approxMeasures: string | null;
    preferredDates: string | null;
    photosCount: number;
    status: "open" | "awarded" | "done" | "cancelled";
    cancelReason: string | null;
    createdAt: string;
    apartment: string;
  };
  conjunto: { name: string; address: string; neighborhood: string | null; cityName: string } | null;
  requester: { name: string; phone: string | null };
  /** Solo en el detalle. */
  passes?: {
    visit: PassCode | null;
    crew: ({ name: string; document: string | null } & Partial<PassCode>)[];
  };
}

const base = "/comercio/home-quotes";
const post = <T>(path: string, body?: unknown) =>
  comercioFetch<T>(`${base}${path}`, { method: "POST", body: JSON.stringify(body ?? {}) });

export const getHomeQuoteChannel = () => comercioFetch<HomeQuoteChannel>(`${base}/profile`);

export const updateHomeQuoteChannel = (data: Partial<Omit<HomeQuoteProfile, "comercioId" | "portfolioImages">>) =>
  comercioFetch<HomeQuoteChannel>(`${base}/profile`, { method: "PUT", body: JSON.stringify(data) });

export const addPortfolioImages = (files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  return comercioFetch<HomeQuoteChannel>(`${base}/profile/portfolio`, { method: "POST", body: form });
};

export const removePortfolioImage = (path: string) =>
  comercioFetch<HomeQuoteChannel>(`${base}/profile/portfolio?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
  });

export const quoteHomePlan = (months: number) => post<HomeQuotePlanQuote>("/plan/quote", { months });
export const payHomePlan = (months: number) =>
  post<HomeQuotePlanStatus & { message: string }>("/plan/pay", { months });

export const getComercioHomeQuotes = (status?: "open" | "work" | "closed") =>
  comercioFetch<ComercioHomeQuote[]>(`${base}/quotes${status ? `?status=${status}` : ""}`);

export const getComercioHomeQuote = (id: string) => comercioFetch<ComercioHomeQuote>(`${base}/quotes/${id}`);

/** La foto pasa por el proxy del comercio, que pone la sesión: sirve en un `<img>`. */
export const homeQuotePhotoUrl = (quoteId: string, index: number) =>
  `/api/comercio/proxy/api${base}/quotes/${quoteId}/photos/${index}`;

export const proposeHomeVisit = (
  id: string,
  data: { visitAt: string; visitorName: string; visitorDocument?: string },
) => post<ComercioHomeQuote>(`/quotes/${id}/visit`, data);

export const sendHomeQuote = (
  id: string,
  data: {
    items: HomeQuoteItem[];
    advanceAmount?: number;
    startDate: string;
    workDays: number;
    validUntil: string;
    notes?: string;
  },
) => post<ComercioHomeQuote>(`/quotes/${id}/quote`, data);

export const declineHomeQuote = (id: string, reason?: string) =>
  post<ComercioHomeQuote>(`/quotes/${id}/decline`, { reason });

export const setHomeCrew = (
  id: string,
  data: { members: { name: string; document?: string }[]; startDate?: string; workDays?: number },
) => post<ComercioHomeQuote>(`/quotes/${id}/crew`, data);

export const markHomeAdvancePaid = (id: string) => post<ComercioHomeQuote>(`/quotes/${id}/paid/advance`);
export const markHomeBalancePaid = (id: string) => post<ComercioHomeQuote>(`/quotes/${id}/paid/balance`);
export const completeHomeWork = (id: string) => post<ComercioHomeQuote>(`/quotes/${id}/complete`);

export const HOME_QUOTE_STATUS: Record<HomeQuoteStatus, { text: string; tone: string }> = {
  requested: { text: "Nueva", tone: "text-sky-300" },
  visit_proposed: { text: "Visita propuesta", tone: "text-amber-300" },
  visit_scheduled: { text: "Visita confirmada", tone: "text-emerald-300" },
  quoted: { text: "Cotizada", tone: "text-sky-300" },
  accepted: { text: "Obra aceptada", tone: "text-emerald-300" },
  completed: { text: "Terminada (falta confirmar)", tone: "text-emerald-300" },
  confirmed: { text: "Confirmada", tone: "text-emerald-400" },
  declined: { text: "No cotizaste", tone: "text-slate-400" },
  rejected: { text: "No la tomaron", tone: "text-slate-400" },
  lost: { text: "Eligieron otra", tone: "text-slate-400" },
  cancelled: { text: "Cancelada", tone: "text-red-300" },
};
