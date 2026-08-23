import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Demanda agregada entre conjuntos: lo que /us/marketclub promete —"la misma
 * necesidad de muchas copropiedades se agrupa en una sola negociación"— ahora
 * se registra desde aquí. Solo el usuario con rol `employee` del conjunto
 * publica o se suma; el backend lo exige con @Roles(UserRole.EMPLOYEE).
 */

export type B2bDemandCategory =
  | "fachada_pintura"
  | "impermeabilizacion"
  | "jardineria"
  | "aseo"
  | "seguridad"
  | "ascensores"
  | "piscina"
  | "energia_solar"
  | "hidraulica"
  | "electrica"
  | "control_acceso"
  | "fumigacion"
  | "otro";

export type B2bDemandStatus =
  | "open"
  | "grouping"
  | "negotiating"
  | "closed"
  | "cancelled";

/** Debe coincidir con los mínimos que valida el backend. */
export const DEMAND_DESCRIPTION_MIN = 30;
export const DEMAND_CANCEL_REASON_MIN = 10;

export const B2B_DEMAND_CATEGORIES: {
  value: B2bDemandCategory;
  label: string;
}[] = [
  { value: "fachada_pintura", label: "Fachada y pintura" },
  { value: "impermeabilizacion", label: "Impermeabilización y cubiertas" },
  { value: "jardineria", label: "Jardinería y zonas verdes" },
  { value: "aseo", label: "Aseo y personal de limpieza" },
  { value: "seguridad", label: "Vigilancia y seguridad" },
  { value: "ascensores", label: "Ascensores" },
  { value: "piscina", label: "Piscina" },
  { value: "energia_solar", label: "Energía solar y eficiencia" },
  { value: "hidraulica", label: "Hidráulica y bombas" },
  { value: "electrica", label: "Instalaciones eléctricas" },
  { value: "control_acceso", label: "Control de acceso y citofonía" },
  { value: "fumigacion", label: "Fumigación y control de plagas" },
  { value: "otro", label: "Otro servicio" },
];

export const DEMAND_CATEGORY_LABELS = B2B_DEMAND_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<B2bDemandCategory, string>,
);

export const DEMAND_STATUS_LABELS: Record<B2bDemandStatus, string> = {
  open: "Buscando conjuntos",
  grouping: "Agrupando demanda",
  negotiating: "En negociación",
  closed: "Cerrada",
  cancelled: "Retirada",
};

export const DEMAND_STATUS_COLORS: Record<B2bDemandStatus, string> = {
  open: "text-amber-400",
  grouping: "text-cyan-300",
  negotiating: "text-emerald-400",
  closed: "text-slate-500",
  cancelled: "text-slate-500",
};

export interface B2bDemand {
  id: string;
  conjuntoId: string;
  conjuntoName: string | null;
  category: B2bDemandCategory;
  /** Texto libre; solo viene cuando `category` es "otro". */
  categoryOther: string | null;
  title: string;
  description: string;
  city: string;
  country: string;
  desiredStartDate: string | null;
  status: B2bDemandStatus;
  /** Desenlace que escribe el equipo del club al negociar o cerrar. */
  outcomeNote: string | null;
  cancellationReason: string | null;
  createdAt: string;
  /** Conjuntos sumados, sin contar al autor. */
  joinedCount: number;
  /** Autor incluido: es el volumen sobre el que se negocia. */
  totalConjuntos: number;
  totalApartamentos: number;
  isOwner: boolean;
  hasJoined: boolean;
}

export interface B2bDemandParticipant {
  conjuntoId: string;
  conjuntoName: string;
  city: string;
  quantityapt: number | null;
  isOwner: boolean;
  note: string | null;
  joinedAt: string;
}

export interface B2bDemandDetail extends B2bDemand {
  /** El backend explica por qué no se puede unir, para mostrarlo tal cual. */
  canJoin: { allowed: boolean; reason?: string };
  participants: B2bDemandParticipant[];
}

export interface CreateB2bDemandPayload {
  category: B2bDemandCategory;
  categoryOther?: string;
  title: string;
  description: string;
  desiredStartDate?: string;
}

export type UpdateB2bDemandPayload = Partial<
  Omit<CreateB2bDemandPayload, "category" | "categoryOther">
>;

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

/**
 * Convocatorias abiertas de la ciudad del conjunto: son las únicas a las que se
 * puede sumar. Agrupar varias ciudades bajo un mismo proveedor lo decide el
 * club desde el ERP, no el conjunto al publicar.
 */
export function getB2bDemands(
  conjuntoId: string,
  filters: {
    category?: B2bDemandCategory;
    search?: string;
  } = {},
) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  const query = params.toString();
  return request<B2bDemand[]>(
    `/conjunto/b2b/demands${query ? `?${query}` : ""}`,
    conjuntoId,
  );
}

/** Lo publicado por mi conjunto más aquello a lo que se sumó. */
export function getMyB2bDemands(conjuntoId: string) {
  return request<B2bDemand[]>("/conjunto/b2b/demands/mine", conjuntoId);
}

export function getB2bDemand(conjuntoId: string, id: string) {
  return request<B2bDemandDetail>(`/conjunto/b2b/demands/${id}`, conjuntoId);
}

export function createB2bDemand(
  conjuntoId: string,
  data: CreateB2bDemandPayload,
) {
  return request<B2bDemand>("/conjunto/b2b/demands", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateB2bDemand(
  conjuntoId: string,
  id: string,
  data: UpdateB2bDemandPayload,
) {
  return request<B2bDemand>(`/conjunto/b2b/demands/${id}`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Retira la convocatoria. El motivo es obligatorio porque otros conjuntos
 * pueden haberse sumado contando con ella.
 */
export function cancelB2bDemand(
  conjuntoId: string,
  id: string,
  data: { reason: string },
) {
  return request<B2bDemand>(`/conjunto/b2b/demands/${id}/cancel`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function joinB2bDemand(
  conjuntoId: string,
  id: string,
  data: { note?: string } = {},
) {
  return request<B2bDemandDetail>(
    `/conjunto/b2b/demands/${id}/join`,
    conjuntoId,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export function leaveB2bDemand(conjuntoId: string, id: string) {
  return request<B2bDemandDetail>(
    `/conjunto/b2b/demands/${id}/join`,
    conjuntoId,
    { method: "DELETE" },
  );
}

/** Etiqueta que se muestra: la categoría, o el texto libre si es "otro". */
export function demandCategoryLabel(demand: {
  category: B2bDemandCategory;
  categoryOther: string | null;
}): string {
  if (demand.category === "otro" && demand.categoryOther) {
    return demand.categoryOther;
  }
  return DEMAND_CATEGORY_LABELS[demand.category] ?? demand.category;
}
