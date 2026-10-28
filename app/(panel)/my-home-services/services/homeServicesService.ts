import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * "Servicios para tu hogar": negocios que cotizan obras en el apartamento
 * (pisos, cocinas, carpintería…). Es el canal de cotizaciones B2C, aparte de
 * la tienda del conjunto.
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

export interface HomeProvider {
  comercioId: string;
  businessName: string;
  logoUrl: string | null;
  headline: string | null;
  description: string | null;
  yearsExperience: number | null;
  trades: HomeTrade[];
  tradeLabels: string[];
  coverage: string[];
  preview: string[];
  rating: number | null;
  reviews: number;
  jobsDone: number;
}

export interface HomeProviderFull extends Omit<HomeProvider, "reviews"> {
  portfolioImages: string[];
  reviews: { rating: number; review: string | null; tradeLabel: string | null; confirmedAt: string }[];
}

export interface ResidentHomeQuote {
  id: string;
  status: HomeQuoteStatus;
  visitAt: string | null;
  visitorName: string | null;
  items: { description: string; amount: number }[];
  amount: number | null;
  advanceAmount: number | null;
  startDate: string | null;
  workDays: number | null;
  validUntil: string | null;
  notes: string | null;
  expired: boolean;
  acceptedAt: string | null;
  advancePaidAt: string | null;
  balancePaidAt: string | null;
  completedAt: string | null;
  confirmedAt: string | null;
  rating: number | null;
  review: string | null;
  closedReason: string | null;
  crew: { name: string }[];
  comercio: { id: string; businessName: string; logoUrl: string | null; phone: string | null };
}

export interface HomeRequest {
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
  quotes: ResidentHomeQuote[];
}

async function call<T>(path: string, conjuntoId: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const response = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      // El backend toma el conjunto de aquí, con la pertenencia comprobada.
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : "No se pudo completar la solicitud",
    );
  }

  return response.json() as Promise<T>;
}

const post = <T>(path: string, conjuntoId: string, body?: unknown) =>
  call<T>(path, conjuntoId, { method: "POST", body: JSON.stringify(body ?? {}) });

export const getHomeTrades = (conjuntoId: string) =>
  call<{ value: HomeTrade; label: string }[]>("/home-services/trades", conjuntoId);

export const getHomeProviders = (conjuntoId: string, trade?: HomeTrade) =>
  call<HomeProvider[]>(`/home-services/providers${trade ? `?trade=${trade}` : ""}`, conjuntoId);

export const getHomeProvider = (conjuntoId: string, comercioId: string) =>
  call<HomeProviderFull>(`/home-services/providers/${comercioId}`, conjuntoId);

export function createHomeRequest(
  conjuntoId: string,
  data: {
    trade: HomeTrade;
    title: string;
    description: string;
    approxMeasures?: string;
    preferredDates?: string;
    comercioIds: string[];
    photos: File[];
  },
) {
  const form = new FormData();
  form.append("trade", data.trade);
  form.append("title", data.title);
  form.append("description", data.description);
  if (data.approxMeasures) form.append("approxMeasures", data.approxMeasures);
  if (data.preferredDates) form.append("preferredDates", data.preferredDates);
  data.comercioIds.forEach((id) => form.append("comercioIds", id));
  data.photos.forEach((photo) => form.append("photos", photo));
  return call<HomeRequest>("/home-services/requests", conjuntoId, { method: "POST", body: form });
}

export const getHomeRequests = (conjuntoId: string) =>
  call<HomeRequest[]>("/home-services/requests", conjuntoId);

export const getHomeRequest = (conjuntoId: string, id: string) =>
  call<HomeRequest>(`/home-services/requests/${id}`, conjuntoId);

/**
 * La foto va por el endpoint autenticado, que pide la cabecera del conjunto:
 * un `<img>` no la manda, así que se baja como blob.
 */
export async function getHomeRequestPhoto(conjuntoId: string, requestId: string, index: number) {
  const response = await fetchWithAuth(
    `${API_URL}/api/home-services/requests/${requestId}/photos/${index}`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );
  if (!response.ok) throw await backendError(response, "No se pudo cargar la foto");
  return URL.createObjectURL(await response.blob());
}

export const cancelHomeRequest = (conjuntoId: string, id: string, reason?: string) =>
  post<HomeRequest>(`/home-services/requests/${id}/cancel`, conjuntoId, { reason });

export const confirmHomeVisit = (conjuntoId: string, quoteId: string) =>
  post<HomeRequest>(`/home-services/quotes/${quoteId}/visit/confirm`, conjuntoId);

export const declineHomeVisit = (conjuntoId: string, quoteId: string, reason?: string) =>
  post<HomeRequest>(`/home-services/quotes/${quoteId}/visit/decline`, conjuntoId, { reason });

export const acceptHomeQuote = (conjuntoId: string, quoteId: string) =>
  post<HomeRequest>(`/home-services/quotes/${quoteId}/accept`, conjuntoId);

export const rejectHomeQuote = (conjuntoId: string, quoteId: string, reason?: string) =>
  post<HomeRequest>(`/home-services/quotes/${quoteId}/reject`, conjuntoId, { reason });

export const confirmHomeWork = (conjuntoId: string, quoteId: string, rating: number, review?: string) =>
  post<HomeRequest>(`/home-services/quotes/${quoteId}/confirm`, conjuntoId, { rating, review });

/** Cómo se lee cada estado desde el lado del residente. */
export const RESIDENT_QUOTE_STATUS: Record<HomeQuoteStatus, string> = {
  requested: "Esperando respuesta",
  visit_proposed: "Propone visita para medir",
  visit_scheduled: "Visita confirmada",
  quoted: "Te mandó su cotización",
  accepted: "Obra contratada",
  completed: "Dice que terminó",
  confirmed: "Obra confirmada",
  declined: "No va a cotizar",
  rejected: "No la tomaste",
  lost: "Elegiste otra",
  cancelled: "Cancelada",
};

export const REQUEST_STATUS: Record<HomeRequest["status"], string> = {
  open: "Abierta",
  awarded: "Contratada",
  done: "Terminada",
  cancelled: "Cancelada",
};
