import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/profile-change-log`;

export interface ProfileChangeEntry {
  field: string;
  label: string;
  before: string | null;
  after: string | null;
}

export interface ProfileChangeLogItem {
  id: string;
  section: "user" | "vehicles";
  changes: ProfileChangeEntry[];
  changedByName: string | null;
  seenAt: string | null;
  createdAt: string;
}

export interface ProfileChangeLogResponse {
  items: ProfileChangeLogItem[];
  unseen: number;
}

export async function getProfileChangeLogService(
  conjuntoId: string,
): Promise<ProfileChangeLogResponse> {
  const response = await fetchWithAuth(`${BASE}/my`, {
    method: "GET",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el historial de cambios");
  }

  return response.json();
}

export async function markProfileChangesSeenService(
  conjuntoId: string,
): Promise<void> {
  await fetchWithAuth(`${BASE}/my/seen`, {
    method: "PATCH",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
  });
}
