import { ShowcaseCampaign } from "./types";

/**
 * El país está fijo mientras sólo se opere Colombia, igual que en el cotizador
 * de `/registers/complex`.
 */
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * El titular de la promoción: lo primero y lo más grande, porque es lo único
 * que la mayoría va a leer.
 *
 * Los meses gratis se anuncian como tiempo, nunca como descuento: "2 meses
 * gratis" es que el periodo dura dos meses más, no que se pague menos.
 */
export function benefitHeadline(campaign: ShowcaseCampaign): string {
  switch (campaign.benefitType) {
    case "PERCENT":
      return `${Math.round(campaign.percentOff * 100)}% de descuento`;

    case "BONUS_MONTHS":
      return `${campaign.bonusMonths} ${
        campaign.bonusMonths === 1 ? "mes gratis" : "meses gratis"
      }`;

    case "FIXED_AMOUNT":
      return `${currencyFormatter.format(campaign.amountOff)} de descuento`;

    case "OVERRIDE_PRICE":
      return "Precio especial";

    default:
      return "Promoción vigente";
  }
}

/**
 * Cuánto dura el beneficio. Sin esto, "20% de descuento" se lee como para
 * siempre, y casi nunca lo es.
 */
export function durationNote(campaign: ShowcaseCampaign): string | null {
  if (campaign.benefitType === "BONUS_MONTHS") return null;
  if (!campaign.appliesToPeriods) return null;

  return campaign.appliesToPeriods === 1
    ? "en tu primer pago"
    : `durante tus primeros ${campaign.appliesToPeriods} pagos`;
}

/** A quién le sirve. Vacío cuando la campaña no tiene límites de tamaño. */
export function audienceNote(campaign: ShowcaseCampaign): string | null {
  const { minApartments: min, maxApartments: max } = campaign;

  if (min && max) return `Para conjuntos de ${min} a ${max} unidades`;
  if (min) return `Para conjuntos desde ${min} unidades`;
  if (max) return `Para conjuntos de hasta ${max} unidades`;

  return null;
}

const PLAN_LABELS: Record<string, string> = {
  basic: "Básico",
  gold: "Gold",
  platinum: "Platinum",
};

/**
 * Plan y periodicidad exigidos.
 *
 * Callarlos es la forma más fácil de romper la promesa del banner: alguien con
 * 120 unidades ve "5 meses gratis", entra al cotizador en mensual con plan Gold
 * y no encuentra nada. Mejor decirlo en el anuncio que decepcionar después.
 */
export function scopeNote(campaign: ShowcaseCampaign): string | null {
  const parts: string[] = [];

  if (campaign.plans?.length) {
    const names = campaign.plans.map((plan) => PLAN_LABELS[plan] ?? plan);

    parts.push(names.length === 1 ? `Plan ${names[0]}` : `Planes ${names.join(" o ")}`);
  }

  if (campaign.billingPeriods?.length) {
    parts.push(`pago ${campaign.billingPeriods.join(" o ")}`);
  }

  return parts.length ? parts.join(" · ") : null;
}

export function deadlineNote(campaign: ShowcaseCampaign): string | null {
  if (!campaign.endsAt) return null;

  const endsAt = new Date(campaign.endsAt);

  if (Number.isNaN(endsAt.getTime())) return null;

  return `Hasta el ${endsAt.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  })}`;
}
