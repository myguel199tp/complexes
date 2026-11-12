import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Cambio de administración por el presidente del consejo
 * (`/api/admin-succession`). Leerlo lo pueden la administración y el consejo;
 * cambiarla, solo el presidente.
 */

export interface CurrentAdmin {
  relationId: string;
  userId: string;
  name: string;
  email: string | null;
}

export interface AdminGovernance {
  hasPresident: boolean;
  isPresident: boolean;
  presidentName: string | null;
  isAdmin: boolean;
  current: CurrentAdmin[];
}

export interface AdminSuccessionInput {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  indicative?: string;
  numberId: string;
  /** Por qué (ej.: acta del consejo): queda en la bitácora. */
  reason: string;
  /** Las administraciones actuales que salen. */
  retireRelationIds: string[];
}

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function call<T>(
  conjuntoId: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${BASE}${path}`, {
    ...init,
    headers: {
      "x-conjunto-id": conjuntoId,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  return response.json();
}

export const adminSuccessionService = {
  governance: (conjuntoId: string) =>
    call<AdminGovernance>(conjuntoId, "/admin-succession"),

  change: (conjuntoId: string, input: AdminSuccessionInput) =>
    call<AdminGovernance>(conjuntoId, "/admin-succession", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  retire: (conjuntoId: string, relationId: string, reason: string) =>
    call<AdminGovernance>(conjuntoId, `/admin-succession/${relationId}/retire`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  resignPresidency: (conjuntoId: string) =>
    call<{ resigned: boolean }>(conjuntoId, "/council/presidency/resign", {
      method: "POST",
    }),
};
