import { deliveryFetch } from "../_lib/delivery-api";
import type {
  SettlementDetailBase,
  SettlementEntry,
  SettlementRowBase,
} from "./deliverySettlementTypes";

/**
 * Pedidos y viajes del repartidor.
 *
 * El repartidor sólo mueve dos estados —salir a entregar y entregar— porque el
 * resto de la vida del pedido no le corresponde: confirmar es del comercio y
 * cancelar, del comercio o del cliente.
 */

export type ComercioOrderStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<ComercioOrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  assigned: "Por recoger",
  in_transit: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export interface DeliveryOrderItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  subtotal: number;
}

/** La plataforma no procesa el dinero: el repartidor lo recibe en la puerta. */
export type PaymentMethod =
  | "contraentrega_efectivo"
  | "contraentrega_datafono"
  | "transferencia";

export type PaymentStatus = "pending" | "reported" | "paid" | "rejected";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  contraentrega_efectivo: "Cobrar en efectivo",
  contraentrega_datafono: "Cobrar con datáfono",
  transferencia: "Ya pagado por transferencia",
};

export interface DeliveryOrder {
  id: string;
  status: ComercioOrderStatus;
  totalAmount: number;
  /**
   * De qué comercio y sucursal es. Viaja con el pedido desde que una persona
   * puede repartir para varios: sin esto no sabría a qué local ir a recogerlo.
   */
  comercio?: { id: string; businessName: string } | null;
  branch?: {
    id: string;
    name: string;
    address?: string;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  /**
   * El conjunto al que va, con su punto mientras el pedido está en la mano:
   * es lo que abre Maps o Waze sin tener que copiar la dirección.
   */
  conjunto?: {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  /** Nombre corto de quien recibe: lo que pregunta la portería. */
  buyerName?: string | null;
  /** Entrega directa: va sola, sin otras paradas. */
  isPriority?: boolean;
  priorityFee?: number;
  /** Lo que ganó con esta entrega, si el comercio registró su tarifa. */
  deliveryPayAmount?: number | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  /** Para cuándo lo pidió el cliente. Nulo = lo antes posible. */
  scheduledFor?: string | null;
  /**
   * Se lo ofrecieron y todavía no responde. Hasta que acepte no ve a quién
   * le entrega ni tiene código de portería; si no responde a tiempo, vuelve
   * al comercio.
   */
  awaitingAcceptance?: boolean;
  deliveryOfferExpiresAt?: string | null;
  assignedAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items: DeliveryOrderItem[];
}

/**
 * En qué está el repartidor. Es distinto de tener cuenta: sin esto el comercio
 * asignaba pedidos sin saber quién estaba en la calle.
 */
export type ShiftStatus = "available" | "busy" | "off";

export const SHIFT_LABELS: Record<ShiftStatus, string> = {
  available: "Disponible",
  busy: "Ocupado",
  off: "Fuera de turno",
};

export const SHIFT_TONE: Record<ShiftStatus, string> = {
  available: "text-emerald-400",
  busy: "text-amber-300",
  off: "text-slate-400",
};

/** Documentos con los que un repartidor puede identificarse. */
export type DeliveryDocumentType = "cc" | "ce" | "passport" | "ppt";

export const DOCUMENT_TYPE_LABELS: Record<DeliveryDocumentType, string> = {
  cc: "Cédula de ciudadanía",
  ce: "Cédula de extranjería",
  passport: "Pasaporte",
  ppt: "Permiso por Protección Temporal",
};

export interface DeliveryProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  /**
   * "available" u "busy" lo calcula el sistema según `activeOrders`; él sólo
   * decide si está en turno o no.
   */
  shiftStatus: ShiftStatus;
  /** Entregas sin cerrar: con alguna, no puede terminar el turno. */
  activeOrders?: number;
  documentType?: DeliveryDocumentType | null;
  documentNumber?: string | null;
  /**
   * Si ya subió su foto y su documento. Mientras sea false el backend le
   * rechaza los pedidos, así que la app lo manda a identificarse.
   */
  onboardingCompleted: boolean;
  /** Perfil de la bolsa de repartidores. */
  selfRegistered?: boolean;
  openToWork?: boolean;
  workCity?: string | null;
  workCountry?: string | null;
  availabilityNote?: string | null;
  workBio?: string | null;
}

/** Un comercio y una sucursal donde el repartidor trabaja hoy. */
export interface DeliveryLink {
  linkId: string;
  comercioId: string;
  comercioName: string | null;
  branchId: string;
  branchName: string | null;
  branchAddress?: string | null;
  branchCity?: string | null;
  branchPhone?: string | null;
  branchLatitude?: number | null;
  branchLongitude?: number | null;
  /** Lo que le pagan por entrega aquí. Nulo = el comercio no lo registró. */
  payPerDelivery?: number | null;
  payPerPriority?: number | null;
  since?: string;
}

export function getMyLinks() {
  return deliveryFetch<DeliveryLink[]>("/delivery-auth/my-links");
}

/**
 * Dejar de trabajar en una sucursal. El backend no deja con entregas sin
 * cerrar de esa sucursal.
 */
export function leaveLink(linkId: string) {
  return deliveryFetch<{ success: boolean }>(
    `/delivery-auth/my-links/${linkId}`,
    { method: "DELETE" },
  );
}

// ─────────────────────── Resumen e historial ───────────────────────

export interface DashboardBucket {
  delivered: number;
  failed: number;
  /** Suma de lo ganado en las entregas que tenían tarifa. */
  earned: number;
  /** Entregas sin tarifa registrada: lo ganado no las incluye. */
  unpriced: number;
  /** Efectivo que cobró en la puerta en ese tramo. */
  cash: number;
}

/** Saldos del corte, al día de hoy. */
export interface SettlementSnapshot {
  /** Efectivo que todavía tiene que entregar al local. */
  cashOwed: number;
  /** Lo que el local todavía le debe. */
  payOwed: number;
  /** Pagos que el comercio registró y él no ha confirmado. */
  pendingPayouts: number;
}

export interface DeliverySummary {
  date: string;
  weekStart: string;
  shiftStatus: ShiftStatus | null;
  active: { total: number; priority: number; inTransit: number };
  today: DashboardBucket;
  week: DashboardBucket;
  settlement?: SettlementSnapshot;
  byComercio: {
    comercioId: string;
    comercioName: string | null;
    today: DashboardBucket;
    week: DashboardBucket;
    settlement?: SettlementSnapshot;
  }[];
}

// ─────────────────────────── Corte diario ───────────────────────────

export interface DeliverySettlementRow extends SettlementRowBase {
  comercioId: string;
  comercioName: string | null;
}

export interface DeliverySettlementOverview {
  day: string;
  today: string;
  rows: DeliverySettlementRow[];
  totals: { cashOwed: number; payOwed: number; pendingPayouts: number };
}

export interface DeliverySettlementDetail extends SettlementDetailBase {
  comercio: { id: string; name: string };
}

export function getMySettlements(day?: string) {
  return deliveryFetch<DeliverySettlementOverview>(
    `/delivery/settlements${day ? `?day=${day}` : ""}`,
  );
}

export function getMySettlement(comercioId: string, day?: string) {
  return deliveryFetch<DeliverySettlementDetail>(
    `/delivery/settlements/${comercioId}${day ? `?day=${day}` : ""}`,
  );
}

export function confirmSettlementPayout(entryId: string) {
  return deliveryFetch<SettlementEntry>(
    `/delivery/settlements/entries/${entryId}/confirm`,
    { method: "PATCH" },
  );
}

export function rejectSettlementPayout(entryId: string, reason: string) {
  return deliveryFetch<SettlementEntry>(
    `/delivery/settlements/entries/${entryId}/reject`,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}

export function getDeliverySummary() {
  return deliveryFetch<DeliverySummary>("/delivery/dashboard/summary");
}

export interface DeliveryHistoryRow {
  kind: "delivered" | "failed";
  orderId: string;
  at: string;
  comercioId: string;
  comercioName: string | null;
  branchName: string | null;
  conjuntoName: string | null;
  deliveryAddress: string | null;
  itemsCount: number | null;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  collectedByMe: boolean;
  isPriority: boolean;
  payAmount: number | null;
  failureReason: string | null;
}

export interface DeliveryHistory {
  from: string;
  to: string;
  totals: { delivered: number; failed: number; earned: number; unpriced: number };
  rows: DeliveryHistoryRow[];
}

export function getDeliveryHistory(params: {
  from?: string;
  to?: string;
  comercioId?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][],
  ).toString();
  return deliveryFetch<DeliveryHistory>(
    `/delivery/dashboard/history${query ? `?${query}` : ""}`,
  );
}

// ─────────────────────── Bolsa de repartidores ───────────────────────

export type JobDirection = "application" | "invitation";
export type JobStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Esperando respuesta",
  accepted: "Aceptada",
  rejected: "Rechazada",
  withdrawn: "Retirada",
  expired: "Venció",
};

export interface HiringBranch {
  branchId: string;
  branchName: string;
  city: string;
  neighborhood: string | null;
  comercioId: string;
  comercioName: string | null;
  comercioLogoUrl: string | null;
  hiringNote: string | null;
  distanceKm: number;
  lastRequest: {
    id: string;
    direction: JobDirection;
    status: JobStatus;
    createdAt: string;
  } | null;
  canApply: boolean;
}

export interface MyJobRequest {
  id: string;
  direction: JobDirection;
  status: JobStatus;
  message: string | null;
  comercioId: string;
  comercioName: string | null;
  comercioLogoUrl: string | null;
  branchId: string;
  branchName: string | null;
  branchCity: string | null;
  offeredPayPerDelivery: number | null;
  offeredPayPerPriority: number | null;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
}

export function updateWorkProfile(input: {
  openToWork?: boolean;
  workCity?: string;
  workCountry?: string;
  availabilityNote?: string;
  workBio?: string;
}) {
  return deliveryFetch<DeliveryProfile>("/delivery-auth/work-profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getHiringBranches() {
  return deliveryFetch<HiringBranch[]>("/delivery/jobs/branches");
}

export function getMyJobRequests() {
  return deliveryFetch<MyJobRequest[]>("/delivery/jobs/requests");
}

export function applyToBranch(branchId: string, message?: string) {
  return deliveryFetch<MyJobRequest>("/delivery/jobs/applications", {
    method: "POST",
    body: JSON.stringify({ branchId, message: message || undefined }),
  });
}

export function respondInvitation(id: string, accept: boolean) {
  return deliveryFetch<{ success: boolean }>(
    `/delivery/jobs/requests/${id}/${accept ? "accept" : "reject"}`,
    { method: "PATCH" },
  );
}

export function withdrawApplication(id: string) {
  return deliveryFetch<{ success: boolean }>(
    `/delivery/jobs/requests/${id}/withdraw`,
    { method: "PATCH" },
  );
}

/**
 * Registro propio. Público, como la activación: todavía no hay sesión. El
 * backend responde lo mismo exista o no el correo, y la contraseña se pone
 * desde el enlace que llega.
 */
export async function registerDelivery(input: {
  fullName: string;
  email: string;
  phone: string;
  indicative?: string;
  vehicleType?: string;
  licensePlate?: string;
  workCity?: string;
  workCountry?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/delivery-auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : response.status === 429
            ? "Demasiados intentos. Espera un minuto e inténtalo de nuevo."
            : "No pudimos crear tu cuenta",
    );
  }

  return response.json() as Promise<{ success: boolean }>;
}

// ─────────────────────── Cómo llegar ───────────────────────

/**
 * Enlaces para abrir la navegación. Con punto, al punto; sin él, a la
 * dirección escrita, que Maps y Waze también entienden.
 */
export function mapsUrl(place: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}) {
  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  }
  if (place.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
  }
  return null;
}

export function wazeUrl(place: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}) {
  if (place.latitude != null && place.longitude != null) {
    return `https://waze.com/ul?ll=${place.latitude},${place.longitude}&navigate=yes`;
  }
  if (place.address) {
    return `https://waze.com/ul?q=${encodeURIComponent(place.address)}&navigate=yes`;
  }
  return null;
}

/**
 * WhatsApp al cliente. Sin indicativo se asume Colombia: el pedido es de un
 * conjunto del país y casi todos los teléfonos llegan sin él.
 */
export function whatsappUrl(phone?: string | null) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  const full = digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits;
  return `https://wa.me/${full}`;
}

export const fmtMoney = (value: number) =>
  `$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

/**
 * Empezar ("available") o terminar ("off") el turno. Si queda libre u ocupado
 * lo decide el backend según las entregas en curso, y no deja terminar con
 * entregas sin cerrar.
 */
export function setShift(status: ShiftStatus) {
  return deliveryFetch<DeliveryProfile>("/delivery-auth/shift", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Activación por invitación. No pasa por `deliveryFetch` porque todavía no hay
 * sesión —justamente lo que este paso crea—, así que va directo a la API.
 */
export async function activateAccount(
  deliveryId: string,
  token: string,
  password: string,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/delivery-auth/activate/${deliveryId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No pudimos activar la cuenta",
    );
  }

  return response.json() as Promise<{ success: boolean }>;
}

export function getDeliveryProfile() {
  return deliveryFetch<DeliveryProfile>("/delivery-auth/profile");
}

/**
 * Identificación del primer ingreso: foto de rostro y documento.
 *
 * Es un solo envío con los dos archivos porque el backend lo trata como un
 * paso atómico: media identificación no habilita nada.
 */
export function completeOnboarding(input: {
  photo: Blob;
  document: File;
  documentType: DeliveryDocumentType;
  documentNumber: string;
}) {
  const body = new FormData();
  // La foto sale de un canvas, así que es un Blob sin nombre: multer necesita
  // uno para decidir la extensión del archivo que guarda.
  body.append("photo", input.photo, "rostro.jpg");
  body.append("document", input.document);
  body.append("documentType", input.documentType);
  body.append("documentNumber", input.documentNumber);

  return deliveryFetch<DeliveryProfile>("/delivery-auth/onboarding", {
    method: "POST",
    body,
  });
}

export function getMyDeliveryOrders(status?: ComercioOrderStatus) {
  const query = status ? `?status=${status}` : "";
  return deliveryFetch<DeliveryOrder[]>(`/delivery/orders${query}`);
}

/**
 * Las dos únicas transiciones del repartidor. El backend exige el orden
 * —`in_transit` sólo desde asignado, `delivered` sólo desde en camino—, así que
 * la pantalla ofrece una sola acción por pedido según dónde esté.
 */
export function markInTransit(id: string) {
  return deliveryFetch<DeliveryOrder>(`/delivery/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "in_transit" }),
  });
}

/**
 * Mínimos que exige el backend. Si la pantalla dejara mandar menos, el
 * servidor lo rechazaría y el repartidor no sabría por qué.
 */
export const DELIVERY_OVERRIDE_REASON_MIN = 15;
export const DELIVERY_FAILURE_REASON_MIN = 15;

/** Lo que el repartidor consiguió en la puerta: el código, o por qué no lo hubo. */
export interface DeliveryHandover {
  deliveryCode?: string;
  overrideReason?: string;
}

/**
 * Cierra la entrega con el código que el cliente dicta en la puerta.
 *
 * Antes esta llamada mandaba sólo el estado, y desde que el backend exige el
 * código —o el motivo de por qué no lo hubo— ningún pedido nuevo se podía
 * cerrar desde la web.
 */
export function markDelivered(id: string, handover: DeliveryHandover) {
  return deliveryFetch<DeliveryOrder>(`/delivery/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "delivered", ...handover }),
  });
}

/**
 * No se pudo entregar. El pedido vuelve al comercio —confirmado y sin
 * repartidor— para que lo reasigne o lo cancele, y sale de esta lista.
 */
export function reportDeliveryFailure(id: string, reason: string) {
  return deliveryFetch<DeliveryOrder>(`/delivery/orders/${id}/fail`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

/** Aceptar un pedido ofrecido: se arma el viaje y su código de portería. */
export function acceptOffer(id: string) {
  return deliveryFetch<DeliveryOrder & { deliveryRunId: string | null }>(
    `/delivery/orders/${id}/accept`,
    { method: "PATCH" },
  );
}

/** "No puedo": vuelve al comercio para que lo lleve otra persona. */
export function declineOffer(id: string, reason?: string) {
  return deliveryFetch<{ success: boolean }>(`/delivery/orders/${id}/decline`, {
    method: "PATCH",
    body: JSON.stringify({ reason: reason?.trim() || undefined }),
  });
}

/** Segundos que le quedan para responder la oferta. */
export function offerSecondsLeft(order: Pick<DeliveryOrder, "deliveryOfferExpiresAt">) {
  if (!order.deliveryOfferExpiresAt) return 0;
  return Math.max(
    0,
    Math.floor((new Date(order.deliveryOfferExpiresAt).getTime() - Date.now()) / 1000),
  );
}

/**
 * Registra el cobro contraentrega. Lo marca el repartidor porque es quien tiene
 * el efectivo o el datáfono en la mano: que lo anote el comercio después
 * convierte el dato en memoria de alguien que no estuvo ahí.
 */
export function collectPayment(id: string) {
  return deliveryFetch<DeliveryOrder>(
    `/delivery/orders/${id}/payment/collect`,
    { method: "PATCH" },
  );
}

// ─────────────────────────── Viajes ───────────────────────────

export type DeliveryRunStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DeliveryRunStopStatus =
  | "pending"
  | "delivered"
  | "failed"
  | "revoked";

export interface DeliveryRunStop {
  id: string;
  orderId: string;
  deliveryAddress?: string | null;
  status: DeliveryRunStopStatus;
  deliveredAt?: string | null;
  notes?: string | null;
}

/**
 * Pase de acceso al conjunto. Es lo que el repartidor muestra en portería y
 * caduca a las tres horas de emitido.
 */
export interface DeliveryAccessPass {
  id: string;
  code: string;
  validFrom: string;
  validTo: string;
  usedAt?: string | null;
  revoked: boolean;
}

/**
 * Un tramo del viaje: un conjunto, su pase y sus paradas. Desde que un viaje
 * recorre varios conjuntos, cada uno tiene su propio código.
 */
export interface DeliveryRunLeg {
  conjuntoId: string;
  conjuntoName: string | null;
  conjuntoAddress: string | null;
  conjuntoCity: string | null;
  latitude: number | null;
  longitude: number | null;
  pendingStops: number;
  pass: {
    id: string;
    code: string;
    validFrom: string;
    validTo: string;
    usedAt: string | null;
  } | null;
  stops: DeliveryRunStop[];
}

export interface DeliveryRun {
  id: string;
  status: DeliveryRunStatus;
  conjuntoId: string;
  conjunto?: { name?: string; address?: string } | null;
  /** De qué comercio es: quien reparte para varios ve todos juntos. */
  comercioName?: string | null;
  /** Viaje de una entrega directa: una sola parada. */
  isPriority?: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  stops: DeliveryRunStop[];
  accessPasses?: DeliveryAccessPass[];
  /** De dónde sale: la sucursal. */
  origin?: {
    branchId: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  /** Los conjuntos del viaje, los que faltan en el orden sugerido. */
  legs?: DeliveryRunLeg[];
}

/**
 * Los tramos del viaje. Un backend viejo no los manda: se arma uno solo con
 * el conjunto y el pase de siempre, que era lo que valía entonces.
 */
export function legsOf(run: DeliveryRun): DeliveryRunLeg[] {
  if (run.legs?.length) return run.legs;

  const pass = usablePass(run);
  return [
    {
      conjuntoId: run.conjuntoId,
      conjuntoName: run.conjunto?.name ?? null,
      conjuntoAddress: run.conjunto?.address ?? null,
      conjuntoCity: null,
      latitude: null,
      longitude: null,
      pendingStops: run.stops.filter((s) => s.status === "pending").length,
      pass: pass
        ? {
            id: pass.id,
            code: pass.code,
            validFrom: pass.validFrom,
            validTo: pass.validTo,
            usedAt: pass.usedAt ?? null,
          }
        : null,
      stops: run.stops,
    },
  ];
}

/** El tramo de un pedido dentro de su viaje. */
export function legForOrder(
  run: DeliveryRun | null,
  orderId: string,
): DeliveryRunLeg | null {
  if (!run) return null;
  return (
    legsOf(run).find((leg) => leg.stops.some((s) => s.orderId === orderId)) ??
    null
  );
}

export function getMyRuns() {
  return deliveryFetch<DeliveryRun[]>("/delivery/runs");
}

/**
 * Cerrar la parada entrega el pedido, así que pide lo mismo que la pantalla de
 * pedidos: si sólo una de las dos exigiera el código, la otra sería la puerta
 * de atrás.
 */
export function markStopDelivered(
  runId: string,
  stopId: string,
  handover: DeliveryHandover,
) {
  return deliveryFetch<DeliveryOrder>(
    `/delivery/runs/${runId}/stops/${stopId}/delivered`,
    { method: "PATCH", body: JSON.stringify(handover) },
  );
}

/** "No se pudo entregar" desde la parada: el mismo reporte que desde el pedido. */
export function reportStopFailure(
  runId: string,
  stopId: string,
  reason: string,
) {
  return deliveryFetch<DeliveryOrder>(
    `/delivery/runs/${runId}/stops/${stopId}/failed`,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}

/**
 * URL del PNG del QR de un viaje.
 *
 * Se pinta con un `<img>` contra el proxy —no con `deliveryFetch`— porque el
 * Bearer lo pone el servidor a partir de la cookie httpOnly, así que el
 * navegador puede pedir la imagen directamente sin que el código toque nunca
 * el token. El QR lo genera el backend: la portería escanea con la cámara y
 * hasta ahora esta pantalla mostraba el código en texto, que nadie puede
 * escanear.
 */
export function runQrUrl(runId: string, conjuntoId?: string, passId?: string) {
  // `pass` solo rompe la caché del navegador al renovar: sin eso, el código
  // nuevo seguía mostrando la imagen del anterior.
  const query = new URLSearchParams();
  if (conjuntoId) query.set("conjuntoId", conjuntoId);
  if (passId) query.set("pass", passId);
  const qs = query.toString();
  return `/api/delivery/proxy/api/delivery/runs/${runId}/qr${qs ? `?${qs}` : ""}`;
}

/**
 * El pase que sirve **ahora**: sin revocar y dentro de la ventana.
 *
 * Un pase ya usado sigue valiendo mientras esté vigente. Antes se descartaba,
 * y como la portería vuelve a escanear cuando el domiciliario sale, la pantalla
 * se quedaba en blanco justo cuando había que mostrar algo.
 */
export function usablePass(run: DeliveryRun): DeliveryAccessPass | null {
  const now = Date.now();

  return (
    (run.accessPasses ?? []).find(
      (pass) =>
        !pass.revoked &&
        new Date(pass.validFrom).getTime() <= now &&
        new Date(pass.validTo).getTime() > now,
    ) ?? null
  );
}

/**
 * Renovar el código vencido sin pasar por el comercio: el que está frente a la
 * reja cuando se acaban las tres horas es el repartidor.
 */
export function reissueRunPass(runId: string, conjuntoId?: string) {
  const query = conjuntoId ? `?conjuntoId=${conjuntoId}` : "";
  return deliveryFetch<DeliveryAccessPass | DeliveryAccessPass[]>(
    `/delivery/runs/${runId}/pass${query}`,
    { method: "POST" },
  );
}

/** El viaje al que pertenece un pedido, o `null` si todavía no está en uno. */
export function runForOrder(
  runs: DeliveryRun[] | undefined,
  orderId: string,
): DeliveryRun | null {
  return (
    (runs ?? []).find((run) =>
      run.stops.some((stop) => stop.orderId === orderId),
    ) ?? null
  );
}
