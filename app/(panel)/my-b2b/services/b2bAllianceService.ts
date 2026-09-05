import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import type { B2bDemandCategory } from "./b2bDemandService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type B2bBillingPeriod = "mensual" | "semestral" | "anual";
export type B2bPricingModel = "fijo" | "por_apartamento";
export type B2bContractStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled"
  /** Servicio cortado por mora. Al pagar lo vencido vuelve a activa. */
  | "suspended";

export type B2bInvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

/** Causales tipificadas exigidas al cancelar una alianza ya activa. */
export type B2bCancellationReason =
  | "incumplimiento"
  | "calidad"
  | "precio"
  | "cierre_servicio"
  | "cambio_proveedor"
  | "otro";

export const B2B_CANCELLATION_REASONS: {
  value: B2bCancellationReason;
  label: string;
}[] = [
  { value: "incumplimiento", label: "Incumplimiento del servicio" },
  { value: "calidad", label: "Calidad insatisfactoria" },
  { value: "precio", label: "Costo o condiciones económicas" },
  { value: "cierre_servicio", label: "Ya no necesitamos el servicio" },
  { value: "cambio_proveedor", label: "Cambio a otro proveedor" },
  { value: "otro", label: "Otro motivo" },
];

/** Debe coincidir con los mínimos que valida el backend. */
export const CANCEL_REASON_MIN_PENDING = 10;
export const CANCEL_REASON_MIN_ACTIVE = 30;

export interface B2bComercio {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  phone?: string;
  /** null cuando el comercio aún no tiene calificaciones. */
  ratingAverage: number | null;
  ratingCount: number;
  /**
   * Servicios que presta, deducidos de sus planes activos. Vacío mientras el
   * comercio no haya clasificado ningún plan.
   */
  categories: B2bDemandCategory[];
  /**
   * Tiene al día y revisados todos los soportes obligatorios (RUT, cámara,
   * ARL, póliza RC). Es el dato que dice si puedes meter a esa empresa al
   * edificio sin quedar expuesto: el conjunto responde solidariamente por su
   * proveedor.
   */
  verified: boolean;
  /** Cuáles le faltan, para poder decirlo en vez de solo negar el sello. */
  missingDocuments: B2bDocumentType[];
}

export type B2bDocumentType =
  | "rut"
  | "camara_comercio"
  | "arl"
  | "poliza_rc"
  | "poliza_cumplimiento"
  | "seguridad_social"
  | "certificado_bancario"
  | "certificado_tecnico"
  | "otro";

export const DOCUMENT_TYPE_LABELS: Record<B2bDocumentType, string> = {
  rut: "RUT",
  camara_comercio: "Cámara de comercio",
  arl: "ARL",
  poliza_rc: "Póliza de responsabilidad civil",
  poliza_cumplimiento: "Póliza de cumplimiento",
  seguridad_social: "Seguridad social",
  certificado_bancario: "Certificación bancaria",
  certificado_tecnico: "Certificación técnica",
  otro: "Otro documento",
};

/** Soporte vigente de un proveedor, tal como lo ve el conjunto. */
export interface B2bProviderDocument {
  id: string;
  type: B2bDocumentType;
  label: string;
  fileName: string;
  documentNumber: string | null;
  issuer: string | null;
  expiresAt: string | null;
  daysToExpiry: number | null;
  requiredForVerification: boolean;
}

export interface B2bProviderCompliance {
  items: B2bProviderDocument[];
  status: {
    verified: boolean;
    missing: B2bDocumentType[];
    expiringSoon: { type: B2bDocumentType; expiresAt: string; days: number }[];
    pendingReview: number;
  };
}

/** Soportes vigentes de un proveedor. Solo lo aprobado y sin vencer. */
export function getB2bComercioCompliance(
  conjuntoId: string,
  comercioId: string,
) {
  return request<B2bProviderCompliance>(
    `/conjunto/b2b/comercios/${comercioId}/compliance`,
    conjuntoId,
  );
}

/**
 * Descarga un soporte del proveedor.
 *
 * Se baja por fetch y no con un `<a href>` porque el backend resuelve el
 * conjunto desde la cabecera `x-conjunto-id`, y un enlace normal no puede
 * mandarla: llegaría sin conjunto y el guard lo rechazaría. El backend además
 * exige tener o haber tenido alianza con ese proveedor, así que esto solo
 * funciona para sus clientes.
 */
export async function downloadProviderDocument(
  conjuntoId: string,
  comercioId: string,
  documentId: string,
  fileName: string,
) {
  const response = await fetchWithAuth(
    `${API_URL}/api/conjunto/b2b/comercios/${comercioId}/compliance/${documentId}/file`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err.message === "string"
        ? err.message
        : "No se pudo descargar el documento",
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  // Sin esto el blob se queda en memoria mientras viva la pestaña.
  URL.revokeObjectURL(url);
}

/** Criterio de orden del directorio. Debe coincidir con el backend. */
export type B2bComercioSort = "rating" | "name" | "recent";

export interface B2bComercioFilters {
  search?: string;
  city?: string;
  category?: B2bDemandCategory;
  minRating?: number;
  /** Solo proveedores con sus soportes obligatorios al día y revisados. */
  onlyVerified?: boolean;
  sort?: B2bComercioSort;
  page?: number;
  limit?: number;
}

/**
 * Sobre paginado del buscador de aliados. El endpoint dejó de devolver un
 * arreglo suelto: sin `total` no hay forma de saber si hay más proveedores que
 * los de la página que se está viendo.
 */
export interface B2bComerciosPage {
  items: B2bComercio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface B2bRating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  conjuntoName: string;
}

export interface B2bPlan {
  id: string;
  name: string;
  description: string;
  /** null en los planes publicados antes de que existiera la clasificación. */
  category?: B2bDemandCategory | null;
  price: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  isActive: boolean;
}

export interface B2bContract {
  id: string;
  comercioId: string;
  comercio?: { businessName: string };
  planName: string;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  quantityapt?: number;
  status: B2bContractStatus;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  cancellationCategory?: B2bCancellationReason;
  confirmedAt?: string;
  cancelledAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  nextPaymentDate?: string;
  createdAt: string;
  /** true si la alianza llegó a estar activa y aún no se ha calificado. */
  canRate?: boolean;
  myRating?: { rating: number; comment?: string } | null;
  /** Lo que el conjunto le adeuda hoy a este proveedor. */
  outstanding?: B2bOutstanding;
}

/**
 * Deuda viva de una alianza. `amount` incluye lo que aún está en plazo;
 * `overdueAmount` es solo lo vencido —que es lo que habilita al proveedor a
 * suspender el servicio.
 */
export interface B2bOutstanding {
  amount: number;
  count: number;
  overdueAmount: number;
  overdueCount: number;
  oldestDueDate: string | null;
  daysOverdue: number;
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

/** Serializa solo los filtros con valor: un `?city=` vacío filtraría por nada. */
function toQuery(
  filters: Record<string, string | number | boolean | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    // `false` también se omite: mandar `onlyVerified=false` es lo mismo que no
    // filtrar, y ensucia la clave de caché con dos formas del mismo estado.
    if (value === undefined || value === "" || value === false) continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getB2bComercios(
  conjuntoId: string,
  filters: B2bComercioFilters = {},
) {
  return request<B2bComerciosPage>(
    `/conjunto/b2b/comercios${toQuery({ ...filters })}`,
    conjuntoId,
  );
}

/**
 * Planes de un comercio. Con `category` mantiene el filtro con el que se llegó
 * desde el buscador, para no aterrizar en el catálogo completo del proveedor.
 */
export function getB2bComercioPlans(
  conjuntoId: string,
  comercioId: string,
  category?: B2bDemandCategory,
) {
  return request<B2bPlan[]>(
    `/conjunto/b2b/comercios/${comercioId}/plans${toQuery({ category })}`,
    conjuntoId,
  );
}

export function requestB2bContract(
  conjuntoId: string,
  data: { planId: string; notes?: string },
) {
  return request<B2bContract>("/conjunto/b2b/contracts", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyB2bContracts(conjuntoId: string) {
  return request<B2bContract[]>("/conjunto/b2b/contracts", conjuntoId);
}

/**
 * Cancela una alianza. El motivo es obligatorio siempre; `category` solo se
 * exige cuando la alianza estaba activa (el backend la ignora si estaba en
 * trámite).
 */
export function cancelB2bContract(
  conjuntoId: string,
  id: string,
  data: { reason: string; category?: B2bCancellationReason },
) {
  return request<B2bContract>(
    `/conjunto/b2b/contracts/${id}/cancel`,
    conjuntoId,
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

/** Califica al comercio de una alianza que llegó a estar activa. */
export function rateB2bComercio(
  conjuntoId: string,
  contractId: string,
  data: { rating: number; comment?: string },
) {
  return request<B2bRating>(
    `/conjunto/b2b/contracts/${contractId}/rating`,
    conjuntoId,
    { method: "POST", body: JSON.stringify(data) },
  );
}

/** Calificaciones publicadas de un comercio. */
export function getB2bComercioRatings(conjuntoId: string, comercioId: string) {
  return request<B2bRating[]>(
    `/conjunto/b2b/comercios/${comercioId}/ratings`,
    conjuntoId,
  );
}

export interface B2bInvoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  planName: string;
  comercioId: string;
  comercioName?: string | null;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  status: B2bInvoiceStatus;
  paidAt?: string | null;
  createdAt: string;
}

/** Lo que los proveedores B2B le han cobrado al conjunto. */
export function getMyB2bInvoices(
  conjuntoId: string,
  status?: B2bInvoiceStatus,
) {
  const query = status ? `?status=${status}` : "";
  return request<B2bInvoice[]>(`/conjunto/b2b/invoices${query}`, conjuntoId);
}
