import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Personal del conjunto: horario, turnos extra y retiro (`/api/staff`).
 *
 * Todo es del conjunto de la sesión: el backend toma el conjunto del
 * `x-conjunto-id`, no de la URL.
 */

/** 1 = lunes … 7 = domingo. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WorkSlot {
  day: IsoWeekday;
  /** `HH:mm`. */
  start: string;
  /** `HH:mm`. Menor o igual que el inicio = termina al día siguiente. */
  end: string;
}

export interface WorkSchedule {
  slots: WorkSlot[];
  toleranceMinutes: number;
}

export interface ExtraShift {
  id: string;
  from: string;
  until: string;
  createdById: string;
  note?: string | null;
}

export interface StaffMember {
  relationId: string;
  userId: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  deactivatedAt: string | null;
  deactivatedReason: string | null;
  /** La administración no lleva horario. */
  canHaveSchedule: boolean;
  workSchedule: WorkSchedule | null;
  extraShifts: ExtraShift[];
  shift: {
    hasSchedule: boolean;
    onShift: boolean;
    nextShiftAt: string | null;
  };
}

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/staff`;

async function call<T>(
  conjuntoId: string,
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const response = await fetchWithAuth(`${BASE}${path}`, {
    method,
    headers: {
      "x-conjunto-id": conjuntoId,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  return response.json();
}

export const staffService = {
  list: (conjuntoId: string) => call<StaffMember[]>(conjuntoId, "", "GET"),

  setSchedule: (
    conjuntoId: string,
    relationId: string,
    schedule: { slots: WorkSlot[]; toleranceMinutes: number },
  ) =>
    call<StaffMember>(conjuntoId, `/${relationId}/schedule`, "PUT", schedule),

  clearSchedule: (conjuntoId: string, relationId: string) =>
    call<StaffMember>(conjuntoId, `/${relationId}/schedule`, "DELETE"),

  addExtraShift: (
    conjuntoId: string,
    relationId: string,
    shift: { from: string; until: string; note?: string },
  ) =>
    call<StaffMember>(conjuntoId, `/${relationId}/extra-shifts`, "POST", shift),

  removeExtraShift: (
    conjuntoId: string,
    relationId: string,
    extraShiftId: string,
  ) =>
    call<StaffMember>(
      conjuntoId,
      `/${relationId}/extra-shifts/${extraShiftId}`,
      "DELETE",
    ),

  retire: (conjuntoId: string, relationId: string, reason?: string) =>
    call<StaffMember>(conjuntoId, `/${relationId}/retire`, "POST", {
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    }),

  reactivate: (conjuntoId: string, relationId: string) =>
    call<StaffMember>(conjuntoId, `/${relationId}/reactivate`, "POST"),
};
