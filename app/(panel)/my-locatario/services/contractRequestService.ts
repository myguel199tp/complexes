import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import {
  ContractRequestResponse,
  ContractRequestStatus,
  ContractRequestType,
} from "./response/contractRequestResponse";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/contract-requests`;

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as T;
}

export interface ContractRequestFilters {
  status?: ContractRequestStatus;
  type?: ContractRequestType;
}

export async function getContractRequestsService(
  conjuntoId: string,
  filters: ContractRequestFilters = {},
): Promise<ContractRequestResponse[]> {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);

  const query = params.toString();

  const response = await fetchWithAuth(`${BASE}${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<ContractRequestResponse[]>(response);
}

export async function getContractRequestService(
  conjuntoId: string,
  requestId: number,
): Promise<ContractRequestResponse> {
  const response = await fetchWithAuth(`${BASE}/${requestId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<ContractRequestResponse>(response);
}

/**
 * Radicación. Va como FormData porque lleva las fotos del daño; por eso no se
 * fija `Content-Type`: el navegador tiene que poner el boundary del multipart.
 */
export async function createContractRequestService(
  conjuntoId: string,
  data: FormData,
): Promise<{ message: string; data: ContractRequestResponse }> {
  const response = await fetchWithAuth(BASE, {
    method: "POST",
    body: data,
    headers: {
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<{ message: string; data: ContractRequestResponse }>(response);
}

export interface UpdateContractRequestPayload {
  status?: ContractRequestStatus;
  priority?: string;
  costBearer?: string;
  resolution?: string;
  estimatedCost?: number;
  actualCost?: number;
  insurerClaimNumber?: string;
}

export async function updateContractRequestService(
  conjuntoId: string,
  requestId: number,
  payload: UpdateContractRequestPayload,
): Promise<ContractRequestResponse> {
  const response = await fetchWithAuth(`${BASE}/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<ContractRequestResponse>(response);
}

export async function addContractRequestMessageService(
  conjuntoId: string,
  requestId: number,
  message: string,
): Promise<ContractRequestResponse> {
  const response = await fetchWithAuth(`${BASE}/${requestId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<ContractRequestResponse>(response);
}

export async function addContractRequestFilesService(
  conjuntoId: string,
  requestId: number,
  data: FormData,
): Promise<ContractRequestResponse> {
  const response = await fetchWithAuth(`${BASE}/${requestId}/files`, {
    method: "POST",
    body: data,
    headers: {
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<ContractRequestResponse>(response);
}

export async function notifyInsurerService(
  conjuntoId: string,
  requestId: number,
): Promise<{ message: string; data: ContractRequestResponse }> {
  const response = await fetchWithAuth(`${BASE}/${requestId}/notify-insurer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  return parse<{ message: string; data: ContractRequestResponse }>(response);
}

/**
 * URL de una evidencia.
 *
 * Se arma contra `/api/proxy` y no con la que devuelve el backend porque el
 * archivo sale por un endpoint autenticado: las cookies de sesión son httpOnly
 * y del dominio de la app, así que un enlace directo al backend llegaría sin
 * sesión. El proxy es quien adjunta el Bearer del lado servidor.
 */
export function contractRequestFileUrl(fileId: string): string {
  return `/api/proxy/contract-requests/files/${fileId}`;
}
