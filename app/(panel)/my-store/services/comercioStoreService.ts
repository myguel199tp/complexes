import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PublicBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood?: string;
  phone?: string;
  comercio: {
    id: string;
    businessName: string;
    ownerName: string;
    phone: string;
    logoUrl?: string;
    description?: string;
  };
  /**
   * Productos disponibles de la sucursal y las primeras fotos del catálogo.
   *
   * Los manda el listado para que la vitrina muestre qué vende cada tienda sin
   * pedir el catálogo de todas: en texto plano ninguna tarjeta daba una razón
   * para abrirla.
   */
  productCount?: number;
  previewImages?: string[];
  /**
   * Si el comercio tiene una cuenta verificada para recibir transferencias.
   * Sólo viene en el detalle de la sucursal; sin cuenta, la opción no se
   * ofrece —el backend la rechazaría—.
   */
  acceptsTransfer?: boolean;
  /**
   * Si la tienda ofrece entrega directa (el pedido sale solo, sin otras
   * paradas) y cuánto le suma al pedido.
   */
  priorityDeliveryEnabled?: boolean;
  priorityDeliveryFee?: number | string;
  /** Domicilio de un pedido con productos. 0 = gratis. */
  deliveryFee?: number | string;
}

/**
 * Un servicio del comercio: una limpieza, un corte, una reparación.
 *
 * Estaban en el catálogo desde el principio pero ninguna vitrina los mostraba,
 * así que el comercio los cargaba y nadie podía pedirlos.
 */
export interface PublicService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes?: number | null;
  /** Se agenda: el pedido tiene que decir para cuándo. */
  requiresReservation: boolean;
  isAvailable: boolean;
  images?: string[];
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  /**
   * Unidades disponibles. `null` significa que el comercio no lleva inventario
   * de este artículo: se puede pedir sin tope. `0` sí es "agotado".
   */
  stock: number | null;
  isAvailable: boolean;
  images?: string[];
}

export type OrderItemType = "product" | "service";

export interface OrderItemInput {
  itemType: OrderItemType;
  productId?: string;
  serviceId?: string;
  quantity: number;
}

/**
 * Cómo se paga. La plataforma no procesa el dinero: va del residente al
 * comercio directamente y aquí sólo se registra lo acordado y si entró.
 */
export type PaymentMethod =
  | "contraentrega_efectivo"
  | "contraentrega_datafono"
  | "transferencia";

export type PaymentStatus = "pending" | "reported" | "paid" | "rejected";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  contraentrega_efectivo: "Efectivo al recibir",
  contraentrega_datafono: "Datáfono al recibir",
  transferencia: "Transferencia antes de la entrega",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Por pagar",
  reported: "Pago reportado, en verificación",
  paid: "Pagado",
  rejected: "Pago no verificado",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending: "text-gray-500",
  reported: "text-amber-600",
  paid: "text-emerald-600",
  rejected: "text-red-500",
};

/** Debe coincidir con el mínimo que valida el backend. */
export const PAYMENT_REFERENCE_MIN = 4;

export interface CreateOrderInput {
  branchId: string;
  items: OrderItemInput[];
  contactPhone?: string;
  contactEmail?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  /** Para cuándo, en ISO. Obligatorio si hay un servicio que se agenda. */
  scheduledFor?: string;
  /** Entrega directa. Solo si la tienda la ofrece; suma su recargo. */
  priority?: boolean;
}

/** Debe coincidir con el backend: el comercio necesita tiempo para confirmar. */
export const SCHEDULE_MIN_LEAD_MINUTES = 30;
export const SCHEDULE_MAX_DAYS_AHEAD = 60;

/** A dónde transferir. Llega sólo mientras el pedido lo deba. */
export interface PayTo {
  bankName: string;
  accountType: "SAVINGS" | "CHECKING";
  accountNumber: string;
  holder: string | null;
  taxId: string | null;
}

export const ACCOUNT_TYPE_LABELS: Record<PayTo["accountType"], string> = {
  SAVINGS: "Ahorros",
  CHECKING: "Corriente",
};

/** La fecha del pedido como la lee una persona: "lunes 20 de octubre, 3:00 p. m.". */
export function formatSchedule(value?: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface MyOrderItem {
  id: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
}

export interface MyOrder {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "assigned"
    | "in_transit"
    | "delivered"
    | "cancelled";
  subtotalAmount: number;
  discountAmount: number;
  /** Entrega directa y su recargo, ya sumado en el total. */
  isPriority?: boolean;
  priorityFee?: number;
  /** Domicilio, ya sumado en el total. 0 = gratis o solo servicios. */
  deliveryFee?: number | string;
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  cancelReason?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paymentRejectionReason?: string | null;
  paidAt?: string | null;
  items: MyOrderItem[];

  /** Para cuándo lo pidió. Nulo = lo antes posible. */
  scheduledFor?: string | null;
  /**
   * A qué cuenta transferir. Antes el pedido ofrecía transferencia y nunca
   * decía a dónde: había que llamar al comercio a preguntar.
   */
  payTo?: PayTo | null;

  /**
   * Los cuatro dígitos que hay que dictarle al repartidor para que pueda
   * cerrar la entrega. Llega desde que el comercio confirma el pedido; nulo
   * antes de eso y en los pedidos anteriores a esta comprobación.
   */
  deliveryCode?: string | null;
  /** Cómo se cerró: con el código o sin él. Nulo = se cerró sin comprobar. */
  deliveryConfirmedWith?: "code" | "override" | null;
  /** Lo que escribió el repartidor cuando entregó sin código. */
  deliveryOverrideReason?: string | null;
  /**
   * El último intento de entrega que no se pudo completar. Con el pedido de
   * vuelta en "confirmado", explica por qué el seguimiento retrocedió.
   */
  deliveryFailedAt?: string | null;
  deliveryFailureReason?: string | null;

  /** De dónde sale el pedido. La lista mezcla tiendas del mismo día. */
  comercio?: { id: string; businessName: string } | null;
  branch?: {
    id: string;
    name: string;
    address: string;
    phone?: string | null;
  } | null;

  /**
   * Quién lo trae. Nulo hasta que el comercio se lo asigna a alguien. El
   * backend recorta a lo que sirve para reconocerlo en la puerta: ni correo ni
   * documento.
   */
  delivery?: {
    fullName: string;
    phone: string;
    indicative?: string | null;
    /** Si hay foto que pedir; se trae por `getDeliveryPhoto`. */
    hasPhoto: boolean;
  } | null;

  /**
   * Cuándo pasó cada cosa. Nulo = todavía no pasó, que es lo que permite
   * dibujar por dónde va el pedido en vez de enseñar una sola palabra.
   */
  createdAt: string;
  confirmedAt?: string | null;
  assignedAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
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

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getActiveBranches(conjuntoId: string) {
  return request<PublicBranch[]>(
    "/conjunto/comercio-orders/browse/branches",
    conjuntoId,
  );
}

export function getBranch(conjuntoId: string, branchId: string) {
  return request<PublicBranch>(
    `/conjunto/comercio-orders/browse/${branchId}`,
    conjuntoId,
  );
}

export function getBranchProducts(conjuntoId: string, branchId: string) {
  return request<PublicProduct[]>(
    `/conjunto/comercio-orders/browse/${branchId}/products`,
    conjuntoId,
  );
}

export function getBranchServices(conjuntoId: string, branchId: string) {
  return request<PublicService[]>(
    `/conjunto/comercio-orders/browse/${branchId}/services`,
    conjuntoId,
  );
}

/** Pase del asistente de una tienda para el residente (ai-assistant-engine). */
export interface StoreAssistantSession {
  token: string;
  expiresIn: number;
  /** De aquí salen el script del widget y el chat. */
  engineUrl: string;
}

/**
 * El pase del asistente de la tienda, o `null` si la tienda no tiene
 * asistente. No lanza: el asistente es un extra de la ficha, y si no está, la
 * ficha simplemente no lo enseña.
 */
export async function getStoreAssistantSession(
  conjuntoId: string,
  branchId: string,
): Promise<StoreAssistantSession | null> {
  try {
    return await request<StoreAssistantSession>(
      `/conjunto/comercio-assistant/${branchId}/session`,
      conjuntoId,
      { method: "POST" },
    );
  } catch {
    return null;
  }
}

export function createStoreOrder(conjuntoId: string, data: CreateOrderInput) {
  return request<MyOrder>("/conjunto/comercio-orders", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyOrders(conjuntoId: string) {
  return request<MyOrder[]>("/conjunto/comercio-orders", conjuntoId);
}

/**
 * La foto de quien trae el pedido, como URL usable en un `<img>`.
 *
 * No es una URL directa: la foto es privada y el backend sólo la entrega al
 * comprador del pedido mientras dura la entrega, así que hay que traerla con
 * la sesión. Quien la use debe revocar la URL al desmontar.
 */
export async function getDeliveryPhoto(
  conjuntoId: string,
  orderId: string,
): Promise<string> {
  const response = await fetchWithAuth(
    `${API_URL}/api/conjunto/comercio-orders/${orderId}/delivery-photo`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) throw await backendError(response, "No hay foto disponible");

  return URL.createObjectURL(await response.blob());
}

export function cancelMyOrder(conjuntoId: string, id: string, reason: string) {
  return request<MyOrder>(`/conjunto/comercio-orders/${id}/cancel`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

/**
 * Reporta la transferencia. Va como multipart y **sin** cabecera
 * `Content-Type`: el navegador tiene que ponerla él para incluir el `boundary`,
 * y fijarla a mano rompe la petición.
 *
 * Queda en verificación, no pagado: el comercio es quien ve su cuenta.
 */
export async function reportMyPayment(
  conjuntoId: string,
  id: string,
  data: { reference: string; note?: string; receipt?: File },
) {
  const form = new FormData();
  form.append("reference", data.reference);
  if (data.note) form.append("note", data.note);
  if (data.receipt) form.append("receipt", data.receipt);

  const response = await fetchWithAuth(
    `${API_URL}/api/conjunto/comercio-orders/${id}/payment/report`,
    { method: "PATCH", headers: { "x-conjunto-id": conjuntoId }, body: form },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No pudimos reportar el pago",
    );
  }

  return response.json() as Promise<MyOrder>;
}

// ───────────────────────────── Reclamos ─────────────────────────────
// Lo que llegó dañado, en mal estado, incompleto o equivocado. El reclamo va
// al comercio que vendió —no al repartidor—, que puede reponer, devolver el
// dinero o rechazarlo con un motivo.

export type ClaimReason =
  | "damaged"
  | "spoiled"
  | "incomplete"
  | "wrong_item"
  | "other";

export const CLAIM_REASON_LABELS: Record<ClaimReason, string> = {
  damaged: "Llegó dañado o roto",
  spoiled: "Llegó en mal estado o vencido",
  incomplete: "Llegó incompleto",
  wrong_item: "No es lo que pedí",
  other: "Otro problema",
};

/** Debe coincidir con el backend: lo roto o descompuesto se prueba con foto. */
export const CLAIM_REASONS_NEEDING_PHOTO: ClaimReason[] = ["damaged", "spoiled"];
export const CLAIM_MAX_PHOTOS = 3;
export const CLAIM_DESCRIPTION_MIN = 10;

export type ClaimResolution = "replacement" | "refund";

export type ClaimStatus =
  | "open"
  | "replacement_in_progress"
  | "refund_reported"
  | "resolved"
  | "rejected"
  | "unanswered"
  | "no_agreement"
  | "withdrawn";

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  open: "Esperando respuesta del comercio",
  replacement_in_progress: "El comercio te lo va a reponer",
  refund_reported: "El comercio registró una devolución",
  resolved: "Resuelto",
  rejected: "Rechazado por el comercio",
  unanswered: "Cerrado sin respuesta",
  no_agreement: "Cerrado sin acuerdo",
  withdrawn: "Retiraste el reclamo",
};

/** Lo que se le dice al comprador cuando el reclamo termina sin acuerdo. */
export const SIC_ORIENTATION =
  "Si no quedaste conforme, puedes presentar una queja ante la Superintendencia de Industria y Comercio (sic.gov.co). Este reclamo queda como constancia de que se lo pediste primero al comercio; guarda las fotos.";

export interface MyClaim {
  id: string;
  orderId: string;
  status: ClaimStatus;
  reason: ClaimReason;
  reasonLabel: string;
  description: string;
  items: { orderItemId: string; name: string; quantity: number; unitPaid: number }[];
  claimedAmount: number;
  photosCount: number;
  requestedResolution: ClaimResolution;
  respondBy: string;
  respondedAt?: string | null;
  comercioResponse?: string | null;
  /** El pedido en $0 que lleva la reposición. */
  replacementOrderId?: string | null;
  refundAmount?: number | null;
  refundReference?: string | null;
  refundReportedAt?: string | null;
  buyerNote?: string | null;
  closedAt?: string | null;
  /** Terminó sin acuerdo: la pantalla orienta a la SIC. */
  withoutAgreement: boolean;
  createdAt: string;
  comercio?: { id: string; businessName: string } | null;
}

export function getMyClaims(conjuntoId: string) {
  return request<{ windowHours: number; claims: MyClaim[] }>(
    "/conjunto/comercio-claims",
    conjuntoId,
  );
}

/**
 * Reclama un pedido entregado. Multipart y sin `Content-Type` a mano, por lo
 * mismo que el comprobante del pago: el navegador tiene que poner el boundary.
 */
export async function createClaim(
  conjuntoId: string,
  data: {
    orderId: string;
    reason: ClaimReason;
    description: string;
    requestedResolution: ClaimResolution;
    items: { orderItemId: string; quantity: number }[];
    photos: File[];
  },
) {
  const form = new FormData();
  form.append("orderId", data.orderId);
  form.append("reason", data.reason);
  form.append("description", data.description);
  form.append("requestedResolution", data.requestedResolution);
  form.append("items", JSON.stringify(data.items));
  data.photos.forEach((photo) => form.append("photos", photo));

  const response = await fetchWithAuth(`${API_URL}/api/conjunto/comercio-claims`, {
    method: "POST",
    headers: { "x-conjunto-id": conjuntoId },
    body: form,
  });

  if (!response.ok) throw await backendError(response, "No pudimos enviar el reclamo");

  return response.json() as Promise<MyClaim>;
}

export function confirmClaimRefund(conjuntoId: string, id: string) {
  return request<MyClaim>(`/conjunto/comercio-claims/${id}/refund/confirm`, conjuntoId, {
    method: "PATCH",
  });
}

export function disputeClaimRefund(conjuntoId: string, id: string, note: string) {
  return request<MyClaim>(`/conjunto/comercio-claims/${id}/refund/dispute`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export function withdrawClaim(conjuntoId: string, id: string, note?: string) {
  return request<MyClaim>(`/conjunto/comercio-claims/${id}/withdraw`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify(note ? { note } : {}),
  });
}

/**
 * Una foto del reclamo como URL para un `<img>`. Es privada: se trae con la
 * sesión. Quien la use debe revocar la URL al desmontar.
 */
export async function getClaimPhoto(
  conjuntoId: string,
  claimId: string,
  index: number,
): Promise<string> {
  const response = await fetchWithAuth(
    `${API_URL}/api/conjunto/comercio-claims/${claimId}/photos/${index}`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) throw await backendError(response, "Foto no disponible");

  return URL.createObjectURL(await response.blob());
}
