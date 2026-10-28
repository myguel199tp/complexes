import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Módulos con cupo mensual: noticias y documentos. */
export type ContentModule = "news" | "documents";

/** Cómo se nombra cada módulo en pantalla: "las noticias", "los documentos". */
export const CONTENT_LABELS: Record<
  ContentModule,
  {
    one: string;
    many: string;
    Many: string;
    /** Artículo y pronombre: "ya las usaste", "ya los usaste". */
    the: string;
    unlimited: string;
    more: string;
  }
> = {
  news: {
    one: "noticia",
    many: "noticias",
    Many: "Noticias",
    the: "las",
    unlimited: "publica noticias sin límite",
    more: "publicar más",
  },
  documents: {
    one: "documento",
    many: "documentos",
    Many: "Documentos",
    the: "los",
    unlimited: "sube documentos sin límite",
    more: "subir más",
  },
};

export const PLAN_LABEL: Record<string, string> = {
  basic: "Básico",
  gold: "Oro",
  platinum: "Platino",
};

/** Un paquete comprado que sigue vigente. */
export interface PackageBalance {
  id: string;
  name: string;
  maxItems: number;
  used: number;
  remaining: number;
  endsAt: string;
}

/** Un paquete a la venta, con el IVA ya calculado. */
export interface PackageOffer {
  id: string;
  name: string;
  maxItems: number;
  durationDays: number;
  /** Sin IVA. */
  price: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
}

/** Cupo del conjunto este mes (mes calendario de Colombia). */
export interface ContentQuota {
  module: ContentModule;
  plan: "basic" | "gold" | "platinum" | string;
  /** Gratis del mes del plan; `null` es sin límite. */
  freeLimit: number | null;
  freeUsed: number;
  freeRemaining: number | null;
  packages: PackageBalance[];
  packageRemaining: number;
  /** Lo que todavía se puede subir; `null` es sin límite. */
  remaining: number | null;
  /** Primer día del mes siguiente: ahí vuelve el cupo gratis. */
  resetsAt: string;
  /** Lo gratis al mes de cada plan. */
  plans: { plan: string; freeLimit: number | null }[];
  offers: PackageOffer[];
  /** No hay pasarela conectada: el pago no mueve dinero real. */
  simulated: boolean;
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  const message = Array.isArray(body?.message)
    ? body.message.join(", ")
    : body?.message;

  return new Error(message || fallback);
}

export async function getContentQuota(
  module: ContentModule,
  conjuntoId: string,
): Promise<ContentQuota> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/content-quota/${module}`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await readError(response, "No se pudo consultar el cupo");
  }

  return response.json();
}

/** Compra el paquete y devuelve el cupo ya con él sumado. */
export async function purchaseContentPackage(
  module: ContentModule,
  conjuntoId: string,
  packageId: string,
): Promise<ContentQuota> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/content-quota/${module}/packages/${packageId}/purchase`,
    { method: "POST", headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await readError(response, "No se pudo comprar el paquete");
  }

  return response.json();
}

/** "1 de noviembre", en hora de Colombia. */
export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  });
