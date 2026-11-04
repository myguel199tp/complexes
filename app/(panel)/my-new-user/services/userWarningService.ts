import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendMessage } from "@/app/helpers/backendError";
import { WarningRequest } from "./request/warningRequest";
import {
  UnitHistoryResponse,
  WarningResponse,
} from "./response/warningResponse";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/resident-warnings`;

async function request<T>(
  conjuntoId: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return response.json();
}

export function createWarningService(conjuntoId: string, data: WarningRequest) {
  return request<WarningResponse>(conjuntoId, "", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getUnitHistoryService(conjuntoId: string, relationId: string) {
  return request<UnitHistoryResponse>(
    conjuntoId,
    `/unit-history/${encodeURIComponent(relationId)}`,
  );
}

export function cancelWarningService(conjuntoId: string, id: string) {
  return request<WarningResponse>(
    conjuntoId,
    `/${encodeURIComponent(id)}/cancel`,
    { method: "PATCH" },
  );
}
