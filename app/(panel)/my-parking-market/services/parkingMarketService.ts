import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Celda que ofrece otro residente, con lo que costaría al mes. */
export interface MarketListing {
  id: string;
  spotCode?: string;
  zone?: string | null;
  spotType?: string;
  description?: string | null;
  /** Canon que pide el dueño. */
  monthlyPrice: number;
  /** Cargo por servicio de la plataforma, en % del canon. */
  feePercent: number;
  /** Cargo por servicio con su IVA. */
  feeWithTax: number;
  /** Lo que se paga al mes: canon + cargo con IVA. */
  monthlyTotal: number;
  /** Ya la pedí y el dueño no ha respondido. */
  requested: boolean;
}

export interface OfferableSpot {
  id: string;
  code: string;
  zone?: string | null;
  type: string;
}

export type ListingStatus =
  | "PENDING"
  | "OPEN"
  | "REJECTED"
  | "RENTED"
  | "CLOSED";

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  PENDING: "Esperando a la administración",
  OPEN: "Publicada",
  REJECTED: "Rechazada",
  RENTED: "Alquilada",
  CLOSED: "Retirada",
};

export type RequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "Esperando al dueño",
  ACCEPTED: "Aceptada",
  DECLINED: "No aceptada",
  CANCELLED: "Cancelada",
};

export interface MyParkingMarket {
  listings: {
    id: string;
    spotCode?: string;
    zone?: string | null;
    monthlyPrice: number;
    description?: string | null;
    status: ListingStatus;
    rejectionReason?: string | null;
    requests: {
      id: string;
      unit: string;
      name?: string | null;
      plate: string;
      message?: string | null;
      createdAt: string;
    }[];
  }[];
  requests: {
    id: string;
    listingId: string;
    spotCode?: string;
    monthlyPrice?: number;
    plate: string;
    status: RequestStatus;
    createdAt: string;
  }[];
  contracts: {
    id: string;
    /** OWNER: alquilo mi celda. TENANT: alquilo la de otro. */
    role: "OWNER" | "TENANT";
    spotCode?: string;
    monthlyFee: number;
    plate?: string | null;
    status: "ACTIVE" | "ENDED" | "CANCELLED";
    startDate: string;
    endDate?: string | null;
    counterpart: string;
    charges: {
      id: string;
      period: string;
      canon: number;
      total: number;
      status: "PENDING" | "PAID" | "CANCELLED";
      dueDate: string;
      paidAt?: string | null;
      payUrl: string | null;
    }[];
  }[];
}

async function request<T>(
  path: string,
  conjuntoId: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : "Ocurrió un error inesperado";
    throw new Error(message);
  }

  return response.json();
}

export const getOpenListings = (conjuntoId: string) =>
  request<MarketListing[]>("/parking-listings", conjuntoId);

export const getMyParkingMarket = (conjuntoId: string) =>
  request<MyParkingMarket>("/parking-listings/mine", conjuntoId);

export const getOfferableSpots = (conjuntoId: string) =>
  request<OfferableSpot[]>("/parking-listings/spots", conjuntoId);

export const publishListing = (
  conjuntoId: string,
  data: { spotId: string; monthlyPrice: number; description?: string },
) =>
  request<unknown>("/parking-listings", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const closeListing = (conjuntoId: string, id: string) =>
  request<unknown>(`/parking-listings/${id}/close`, conjuntoId, {
    method: "PATCH",
  });

export const requestListing = (
  conjuntoId: string,
  id: string,
  data: { plate: string; message?: string },
) =>
  request<unknown>(`/parking-listings/${id}/requests`, conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const acceptRequest = (conjuntoId: string, id: string) =>
  request<unknown>(`/parking-listings/requests/${id}/accept`, conjuntoId, {
    method: "PATCH",
  });

export const declineRequest = (conjuntoId: string, id: string) =>
  request<unknown>(`/parking-listings/requests/${id}/decline`, conjuntoId, {
    method: "PATCH",
  });

export const cancelRequest = (conjuntoId: string, id: string) =>
  request<unknown>(`/parking-listings/requests/${id}/cancel`, conjuntoId, {
    method: "PATCH",
  });

export const endContract = (conjuntoId: string, id: string) =>
  request<unknown>(`/parking-listings/contracts/${id}/end`, conjuntoId, {
    method: "PATCH",
  });
