import { comercioFetch } from "../../_lib/comercio-api";
import type { B2bBillingPeriod } from "./b2bPlansService";

/**
 * Suscripción de acceso que la plataforma le cobra al comercio B2B para poder
 * operar. No confundir con `b2bPlansService`, que son los planes que el
 * comercio le vende a los conjuntos.
 *
 * Los valores los administra el ERP: aquí no hay ningún precio quemado.
 */
export interface B2bAccessPlan {
  id: string;
  code: string;
  name: string;
  tagline: string;
  features: string[];
  price: number;
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
    price: number;
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
 * El body sólo lleva el plan: monto, moneda y periodicidad los resuelve el
 * servidor contra el catálogo, para que nadie pueda "pagar" el plan más caro
 * por cero.
 */
export function payB2bAccess(planId: string) {
  return comercioFetch<B2bAccessStatus & { message: string; reference: string }>(
    "/comercio/b2b-access/pay",
    {
      method: "POST",
      body: JSON.stringify({ planId }),
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
