/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useState } from "react";
import { useRegisterStore } from "../store/registerStore";

type BillingPeriod = "mensual" | "anual";

export const pricingByCountry: Record<
  string,
  {
    pricePerApt: number;
    tax: number;
    currency: string;
    locale: string;
    multipliers: { basic: number; gold: number; platinum: number };
  }
> = {
  CO: {
    pricePerApt: 2000, // competitivo para grandes conjuntos
    tax: 0.19,
    currency: "COP",
    locale: "es-CO",
    multipliers: { basic: 1, gold: 1.83, platinum: 2.92 }, // basic 3k, gold ~5.5k, platinum ~8.75k
  },

  // Argentina (ARS)
  AR: {
    pricePerApt: 500, // competitivo para grandes conjuntos
    tax: 0.21,
    currency: "ARS",
    locale: "es-AR",
    multipliers: { basic: 1, gold: 1.8, platinum: 2.8 }, // basic 500, gold ~900, platinum ~1400
  },

  // Chile (CLP)
  CL: {
    pricePerApt: 2000, // competitivo para grandes conjuntos
    tax: 0.19,
    currency: "CLP",
    locale: "es-CL",
    multipliers: { basic: 1, gold: 1.8, platinum: 2.9 }, // basic 2k, gold ~3.6k, platinum ~5.8k
  },

  // Perú (PEN)
  PE: {
    pricePerApt: 20, // competitivo para grandes conjuntos
    tax: 0.18,
    currency: "PEN",
    locale: "es-PE",
    multipliers: { basic: 1, gold: 1.8, platinum: 2.9 }, // basic 20, gold ~36, platinum ~58
  },

  // Estados Unidos (USD)
  US: {
    pricePerApt: 10, // competitivo para grandes conjuntos
    tax: 0.07,
    currency: "USD",
    locale: "en-US",
    multipliers: { basic: 1, gold: 1.8, platinum: 2.9 }, // basic $5, gold ~$9, platinum ~$15
  },
};

export default function paymentsInfo(
  country: keyof typeof pricingByCountry = "CO"
) {
  const [apartmentCount, setApartmentCount] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensual");
  const { setQuantity } = useRegisterStore();

  const pricing = pricingByCountry[country];
  const numericValue = Number(apartmentCount);
  const isValid = numericValue >= 10; // mínimo 10

  // === CONFIGURACIÓN ===
  const minCount = 10; // límite inferior
  const maxCount = 1000; // referencia donde perApt = perAptAtMax
  const perAptAtMax = pricing?.pricePerApt; // per-apartamento cuando count = maxCount

  // Opción A: step fijo (por cada apto que pierdes respecto a maxCount, sube 'step')
  // Opción B: anclas min/max con perAptAtMin definido (step se calcula automáticamente)
  // =======================

  // Función que calcula per-apartamento según la configuración elegida
  // Función que calcula per-apartamento con steps escalonados
  const perAptFromCount = (count: number) => {
    if (count >= maxCount) return perAptAtMax;

    let price = perAptAtMax;

    // Ajustar steps según moneda
    const step = pricing.currency === "USD" ? 0.1 : 3; // por ejemplo
    const step2 = pricing.currency === "USD" ? 0.2 : 5;
    const step3 = pricing.currency === "USD" ? 0.5 : 15.5;

    if (count < maxCount && count >= 300) {
      price += (maxCount - count) * step;
    } else if (count < 300 && count >= 150) {
      price += (maxCount - 300) * step;
      price += (300 - count) * step2;
    } else if (count < 150 && count >= minCount) {
      price += (maxCount - 300) * step;
      price += (300 - 150) * step2;
      price += (150 - count) * step3;
    } else if (count < minCount) {
      price += (maxCount - 300) * step;
      price += (300 - 150) * step2;
      price += (150 - minCount) * step3;
    }

    return price;
  };

  const calculateBase = (planMultiplier: number) => {
    if (!isValid || !pricing) return { total: 0, perApt: 0, perAptWithTax: 0 };

    const perAptBase = perAptFromCount(numericValue); // precio por apto antes de multiplier
    const perAptPlan = perAptBase * planMultiplier; // aplica plan multiplier

    const subtotal = perAptPlan * numericValue;
    const withTax = subtotal * (1 + pricing.tax);
    const total = billingPeriod === "mensual" ? withTax : withTax * 12;
    const perAptWithTax = perAptPlan * (1 + pricing.tax);

    return { total, perApt: perAptPlan, perAptWithTax };
  };

  const plansPerApartment = useMemo(() => {
    if (!isValid || !pricing) return { basic: 0, gold: 0, platinum: 0 };
    const basic = calculateBase(pricing.multipliers.basic);
    const gold = calculateBase(pricing.multipliers.gold);
    const plat = calculateBase(pricing.multipliers.platinum);

    return {
      basic: Math.round(basic.perApt),
      gold: Math.round(gold.perApt),
      platinum: Math.round(plat.perApt),
    };
  }, [numericValue, billingPeriod, pricing]);

  const plans = useMemo(() => {
    if (!isValid || !pricing) return { basic: 0, gold: 0, platinum: 0 };
    return {
      basic: Math.round(calculateBase(pricing.multipliers.basic).total),
      gold: Math.round(calculateBase(pricing.multipliers.gold).total),
      platinum: Math.round(calculateBase(pricing.multipliers.platinum).total),
    };
  }, [numericValue, billingPeriod, pricing]);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat(pricing.locale, {
      style: "currency",
      currency: pricing.currency,
    }).format(amount);

  useEffect(() => {
    if (isValid) setQuantity(numericValue);
  }, [isValid, numericValue, setQuantity]);

  return {
    apartmentCount,
    numericValue,
    isValid,
    plans,
    plansPerApartment,
    formatPrice,
    setBillingPeriod,
    setApartmentCount,
  };
}
