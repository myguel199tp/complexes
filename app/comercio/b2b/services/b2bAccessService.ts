import { comercioFetch } from "../../_lib/comercio-api";
import type { AwaitingPayment } from "@/app/components/platform-charge/platform-charge-api";
import type { B2bBillingPeriod } from "./b2bPlansService";

/**
 * Suscripción de acceso que la plataforma le cobra al comercio B2B para poder
 * operar. No confundir con `b2bPlansService`, que son los planes que el
 * comercio le vende a los conjuntos.
 *
 * Los valores los administra el ERP: aquí no hay ningún precio quemado.
 */
/** Lo que se vende: el acceso B2B ya no se paga por mes. */
export type B2bAccessPeriod = "semestral" | "anual";

/** Lo que cuesta el plan en una periodicidad, con y sin IVA. */
export interface B2bAccessPlanPeriod {
  billingPeriod: B2bAccessPeriod;
  /** Meses que dura: 6 o 12 (el año cobra 11). */
  months: number;
  /** Sin IVA. */
  price: number;
  taxAmount: number;
  total: number;
}

export interface B2bAccessPlan {
  id: string;
  code: string;
  name: string;
  tagline: string;
  features: string[];
  /** Mensual de referencia, sin IVA: "equivale a $X al mes". No se cobra por mes. */
  price: number;
  /** Las periodicidades en que se vende (semestre y año). */
  periods: B2bAccessPlanPeriod[];
  /** IVA del país del comercio (0.19 = 19%). */
  taxRate: number;
  taxAmount: number;
  /** Lo que se paga: `price + taxAmount`. */
  total: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  isActive: boolean;
  isHighlighted: boolean;
  sortOrder: number;
}

export interface B2bAccessSubscription {
  reference: string;
  paidAt: string;
  expiresAt: string;
  daysRemaining: number;
  /** El cobro todavía no pasa por pasarela: el backend lo aprueba solo. */
  simulated: boolean;
}

/** Qué habilita el plan pagado. Los topes en null son "sin límite". */
export interface B2bAccessLimits {
  maxServicePlans: number | null;
  maxActiveContracts: number | null;
  hasAgenda: boolean;
  hasInvoicing: boolean;
  hasAssistant: boolean;
}

/** Cuánto lleva consumido de esos topes. */
export interface B2bAccessUsage {
  servicePlans: number;
  activeContracts: number;
}

export interface B2bAccessStatus {
  /** false para un comercio B2C: a ese este cobro no le aplica. */
  applies: boolean;
  planActive: boolean;
  plan: {
    id: string | null;
    code: string;
    name: string;
    /** Sin IVA. */
    price: number;
    taxAmount: number;
    /** Lo pagado, con IVA. */
    total: number;
    currency: string;
    billingPeriod: B2bBillingPeriod;
  } | null;
  subscription: B2bAccessSubscription | null;
  limits: B2bAccessLimits;
  /** null mientras no haya plan vigente: no hay nada que consumir. */
  usage: B2bAccessUsage | null;
  /** Fecha en que venció el último pago, cuando ya no da acceso. */
  expiredAt: string | null;
}

export function getB2bAccessPlans() {
  return comercioFetch<B2bAccessPlan[]>("/comercio/b2b-access/plans");
}

export function getB2bAccessStatus() {
  return comercioFetch<B2bAccessStatus>("/comercio/b2b-access/status");
}

/**
 * El body lleva el plan y si se paga por semestre o por año: el monto y la
 * moneda los resuelve el servidor contra el catálogo, para que nadie pueda
 * "pagar" el plan más caro por cero.
 */
export function payB2bAccess(planId: string, billingPeriod: B2bAccessPeriod) {
  // Con Bre-B responde el cobro a pagar: el acceso se abre al verificarlo.
  return comercioFetch<
    (B2bAccessStatus & { message: string; reference: string }) | AwaitingPayment
  >(
    "/comercio/b2b-access/pay",
    {
      method: "POST",
      body: JSON.stringify({ planId, billingPeriod }),
    },
  );
}

export function formatComercioPrice(value: number, currency: string) {
  return `$${value.toLocaleString("es-CO")} ${currency}`;
}

const PERIOD_LABEL: Record<B2bBillingPeriod, string> = {
  mensual: "mes",
  semestral: "semestre",
  anual: "año",
};

export function billingPeriodLabel(period: B2bBillingPeriod) {
  return PERIOD_LABEL[period] ?? period;
}

/** queryKey compartida: el paywall, el gate y el dashboard leen el mismo estado. */
export const B2B_ACCESS_STATUS_KEY = ["comercio_b2b_access_status"];
