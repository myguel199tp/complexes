import { backendError } from "@/app/helpers/backendError";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export type ParcelStatus = "PENDING" | "DELIVERED" | "CANCELLED" | "REFUSED";

/** Por qué portería no recibió un paquete. */
export type ParcelRefusalKind = "CASH_ON_DELIVERY" | "RECIPIENT_ONLY" | "OTHER";

export const REFUSAL_KIND_LABEL: Record<ParcelRefusalKind, string> = {
  CASH_ON_DELIVERY: "Contraentrega sin quién pagara",
  RECIPIENT_ONLY: "Solo lo entregan al destinatario",
  OTHER: "Otro motivo",
};

export type ExpectedParcelStatus = "WAITING" | "RECEIVED" | "CANCELLED" | "EXPIRED";

export type ParcelCashStatus = "HELD" | "CLOSED";
export type CashAnswer = "CONFIRMED" | "DISPUTED";

/** Plata que un residente le dejó a portería para pagar un contraentrega. */
export interface ParcelCash {
  id: string;
  expectedParcelId: string;
  apartment: string;
  tower?: string | null;
  amount: number;
  receivedAt: string;
  receivedBy?: { id: string; name: string } | null;
  receiptAnswer?: CashAnswer | null;
  paidAmount?: number | null;
  paidAt?: string | null;
  returnedAmount?: number | null;
  returnedAt?: string | null;
  returnedToName?: string | null;
  returnAnswer?: CashAnswer | null;
  status: ParcelCashStatus;
  expectedParcel?: { carrier?: string | null; description?: string | null } | null;
}

/** Con lo que sigue en portería ya calculado. */
export type ParcelCashRow = ParcelCash & { held: number };

export const money = (amount: number) =>
  `$${Math.round(amount).toLocaleString("es-CO")}`;

/** Lo que sigue en portería: lo entregado menos lo pagado y lo devuelto. */
export const heldOf = (cash: ParcelCash) =>
  cash.amount - (cash.paidAmount ?? 0) - (cash.returnedAmount ?? 0);

/** Un paquete que un residente avisó que va a llegar. */
export interface ExpectedParcel {
  id: string;
  apartment: string;
  tower?: string | null;
  carrier?: string | null;
  description?: string | null;
  /** yyyy-mm-dd, calendario de Colombia. */
  expectedDate: string;
  cashOnDelivery: boolean;
  notes?: string | null;
  status: ExpectedParcelStatus;
  createdBy?: { id: string; name: string } | null;
  /** La plata que la unidad dejó para pagarlo, si la dejó. */
  cash?: ParcelCash | null;
  createdAt: string;
}

export interface MyExpectedParcels {
  /** Solo quien vive en una unidad puede avisar. */
  canAnnounce: boolean;
  items: ExpectedParcel[];
}

/** Por qué un paquete se cerró sin entregarse. */
export type ParcelCancelKind = "ERROR" | "RETURNED" | "LOST";

export const CANCEL_KIND_LABEL: Record<ParcelCancelKind, string> = {
  ERROR: "Registrado por error",
  RETURNED: "Devuelto a la transportadora",
  LOST: "Perdido",
};

/** Cómo se muestra un paquete ya cerrado sin entregar. */
export const CANCEL_KIND_STATUS: Record<ParcelCancelKind, string> = {
  ERROR: "Anulado",
  RETURNED: "Devuelto",
  LOST: "Perdido",
};

export type ReceiptAnswer = "CONFIRMED" | "DISPUTED";

export interface Parcel {
  id: string;
  apartment: string;
  tower?: string | null;
  recipientName?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  description?: string | null;
  quantity: number;
  photo?: string | null;
  /** Cuándo llegó de verdad; `createdAt` es cuándo se anotó. */
  receivedAt: string;
  urgent: boolean;
  damaged: boolean;
  /** Solo en la lista de portería: se anotó bastante después de llegar. */
  registeredLate?: boolean;
  status: ParcelStatus;
  receivedBy?: { id: string; name: string } | null;
  deliveredBy?: { id: string; name: string } | null;
  deliveredToName?: string | null;
  deliveredToDocument?: string | null;
  deliveredAt?: string | null;
  /**
   * La unidad confirmó o desmintió la entrega. Sin respuesta, "Entregado" es
   * solo la palabra del celador.
   */
  receiptAnswer?: ReceiptAnswer | null;
  receiptAnsweredAt?: string | null;
  /** Solo en la lista de portería: quién de la unidad respondió. */
  receiptAnsweredBy?: { id: string; name: string } | null;
  /** Entregado y la unidad todavía puede confirmar (7 días). */
  awaitingReceipt?: boolean;
  cancelKind?: ParcelCancelKind | null;
  cancelReason?: string | null;
  refusalKind?: ParcelRefusalKind | null;
  refusalReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export interface ParcelPage {
  data: Parcel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Paquetes guardados hoy en portería, sin importar el filtro. */
  pending: number;
}

export interface ParcelFilters {
  status?: ParcelStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegisteredParcel {
  parcel: Parcel;
  /** A cuántas personas les llegó el aviso. Con 0, nadie se enteró. */
  notified: number;
}

/** A quién se le puede registrar un paquete. */
export interface ParcelResident {
  id: string;
  name: string | null;
  apartment: string;
  tower: string | null;
  file: string | null;
}

const url = (path = "") =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/parcel${path}`;

export async function getParcels(
  conjuntoId: string,
  { status, search, page = 1, limit = 20 }: ParcelFilters,
): Promise<ParcelPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());

  const response = await fetchWithAuth(url(`?${params}`), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar los paquetes");
  }

  return response.json();
}

export async function getMyParcels(conjuntoId: string): Promise<Parcel[]> {
  const response = await fetchWithAuth(url("/mine"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar tus paquetes");
  }

  return response.json();
}

export async function getParcelResidents(
  conjuntoId: string,
): Promise<ParcelResident[]> {
  const response = await fetchWithAuth(url("/residents"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar los residentes");
  }

  return response.json();
}

/** Va en `FormData` porque puede llevar la foto. */
export async function registerParcel(
  conjuntoId: string,
  data: FormData,
): Promise<RegisteredParcel> {
  const response = await fetchWithAuth(url(), {
    method: "POST",
    headers: { "x-conjunto-id": conjuntoId },
    body: data,
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo registrar el paquete");
  }

  return response.json();
}

export async function deliverParcel(
  conjuntoId: string,
  id: string,
  body: { deliveredToName: string; deliveredToDocument?: string },
): Promise<Parcel> {
  const response = await fetchWithAuth(url(`/${id}/deliver`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo entregar el paquete");
  }

  return response.json();
}

/** La unidad confirma o desmiente que recibió lo que portería entregó. */
export async function answerParcelReceipt(
  conjuntoId: string,
  id: string,
  received: boolean,
): Promise<Parcel> {
  const response = await fetchWithAuth(url(`/${id}/receipt`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ received }),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo guardar tu respuesta");
  }

  return response.json();
}

export async function cancelParcel(
  conjuntoId: string,
  id: string,
  kind: ParcelCancelKind,
  reason: string,
): Promise<Parcel> {
  const response = await fetchWithAuth(url(`/${id}/cancel`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ kind, reason }),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cerrar el paquete");
  }

  return response.json();
}

export async function refuseParcel(
  conjuntoId: string,
  body: {
    apartment: string;
    tower?: string;
    recipientName?: string;
    carrier?: string;
    description?: string;
    kind: ParcelRefusalKind;
    reason?: string;
  },
): Promise<RegisteredParcel> {
  const response = await fetchWithAuth(url("/refused"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo dejar la constancia");
  }

  return response.json();
}

/** Lo que portería está esperando. */
export async function getExpectedParcels(
  conjuntoId: string,
): Promise<ExpectedParcel[]> {
  const response = await fetchWithAuth(url("/expected"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar los esperados");
  }

  return response.json();
}

export async function getMyExpectedParcels(
  conjuntoId: string,
): Promise<MyExpectedParcels> {
  const response = await fetchWithAuth(url("/expected/mine"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar tus avisos");
  }

  return response.json();
}

export async function announceParcel(
  conjuntoId: string,
  body: {
    carrier?: string;
    description?: string;
    expectedDate: string;
    cashOnDelivery?: boolean;
    notes?: string;
  },
): Promise<ExpectedParcel> {
  const response = await fetchWithAuth(url("/expected"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo avisar a portería");
  }

  return response.json();
}

export async function cancelExpectedParcel(
  conjuntoId: string,
  id: string,
): Promise<ExpectedParcel> {
  const response = await fetchWithAuth(url(`/expected/${id}/cancel`), {
    method: "PATCH",
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cancelar el aviso");
  }

  return response.json();
}

// ── Dinero en portería ──────────────────────────────────────────────────

export async function getCashSettings(
  conjuntoId: string,
): Promise<{ enabled: boolean }> {
  const response = await fetchWithAuth(url("/cash/settings"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo leer el ajuste");
  }

  return response.json();
}

export async function updateCashSettings(
  conjuntoId: string,
  enabled: boolean,
): Promise<{ enabled: boolean }> {
  const response = await fetchWithAuth(url("/cash/settings"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cambiar el ajuste");
  }

  return response.json();
}

export async function receiveCash(
  conjuntoId: string,
  body: {
    expectedId?: string;
    apartment?: string;
    tower?: string;
    carrier?: string;
    description?: string;
    amount: number;
  },
): Promise<ParcelCash> {
  const response = await fetchWithAuth(url("/cash"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo registrar el dinero");
  }

  return response.json();
}

export async function getOpenCash(
  conjuntoId: string,
): Promise<{ items: ParcelCashRow[]; heldTotal: number }> {
  const response = await fetchWithAuth(url("/cash"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cargar el dinero en portería");
  }

  return response.json();
}

export async function returnCash(
  conjuntoId: string,
  id: string,
  returnedToName: string,
): Promise<ParcelCash> {
  const response = await fetchWithAuth(url(`/cash/${id}/return`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ returnedToName }),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo registrar la devolución");
  }

  return response.json();
}

export async function getMyCash(conjuntoId: string): Promise<ParcelCashRow[]> {
  const response = await fetchWithAuth(url("/cash/mine"), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cargar tu dinero en portería");
  }

  return response.json();
}

export async function answerCash(
  conjuntoId: string,
  id: string,
  stage: "receipt" | "return",
  correct: boolean,
): Promise<ParcelCash> {
  const response = await fetchWithAuth(url(`/cash/${id}/answer`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: JSON.stringify({ stage, correct }),
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo guardar tu respuesta");
  }

  return response.json();
}

/** El día de hoy en Colombia, `yyyy-mm-dd`. */
export const bogotaToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
    new Date(),
  );

export const addDays = (isoDate: string, days: number) => {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** "Hoy", "Mañana", "6 de nov" o "Venció el 6 de nov". */
export function expectedDayLabel(isoDate: string) {
  const today = bogotaToday();
  const day = new Date(`${isoDate}T12:00:00-05:00`).toLocaleDateString(
    "es-CO",
    { day: "numeric", month: "short", timeZone: "America/Bogota" },
  );

  if (isoDate === today) return { label: "Hoy", today: true, overdue: false };
  if (isoDate === addDays(today, 1)) {
    return { label: "Mañana", today: false, overdue: false };
  }
  if (isoDate < today) {
    return { label: `Venció el ${day}`, today: false, overdue: true };
  }
  return { label: day, today: false, overdue: false };
}

/** Misma unidad: apartamento y torre, sin importar mayúsculas ni espacios. */
export const sameUnit = (
  a: { apartment?: string | null; tower?: string | null },
  b: { apartment?: string | null; tower?: string | null },
) =>
  (a.apartment ?? "").trim().toLowerCase() ===
    (b.apartment ?? "").trim().toLowerCase() &&
  (a.tower ?? "").trim().toLowerCase() === (b.tower ?? "").trim().toLowerCase();

/** La foto no es pública: la etiqueta trae los datos del residente. */
export async function getParcelPhoto(
  conjuntoId: string,
  id: string,
): Promise<Blob> {
  const response = await fetchWithAuth(url(`/${id}/photo`), {
    headers: { "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) {
    throw await backendError(response, "No se pudo cargar la foto");
  }

  return response.blob();
}

export const parcelUnit = (parcel: Pick<Parcel, "apartment" | "tower">) =>
  parcel.tower
    ? `Torre ${parcel.tower} · Apto ${parcel.apartment}`
    : `Apto ${parcel.apartment}`;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Días completos que lleva esperando en portería. */
export const daysWaiting = (parcel: Pick<Parcel, "receivedAt">) =>
  Math.floor((Date.now() - new Date(parcel.receivedAt).getTime()) / DAY_MS);

export const parcelDate = (date: string) =>
  new Date(date).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
