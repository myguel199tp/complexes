"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, InputField, Text, Title } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { infoPayments } from "@/app/(sets)/registers/_components/register-complex/info-payments";
import { planFeatures } from "@/app/(sets)/registers/_components/register-complex/plans-features";
import { useLanguage } from "@/app/hooks/useLanguage";
import { PricingErrorCode } from "@/app/(sets)/registers/services/response/pricingResponse";

type PlanType = "basic" | "gold" | "platinum";
type BillingPeriod = "mensual" | "trimestral" | "semestral" | "anual";

/**
 * Cotizador público de planes.
 *
 * Reutiliza el mismo endpoint que el registro (`/pricing/calculate`) en vez de
 * publicar una tabla de precios estática: si la tarifa cambia en el ERP, esta
 * página cambia sola y nunca queda desalineada con lo que se cobra al firmar.
 */

/** El país está fijo igual que en el registro; cuando se abra otro mercado
 * basta con volver esto un selector alimentado por `useCountryOptions`. */
const COUNTRY = "CO";

const BILLING_OPTIONS: { value: BillingPeriod; label: string }[] = [
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const PLAN_META: Record<
  PlanType,
  { name: string; pitch: string; highlight: boolean }
> = {
  basic: {
    name: "Básico",
    pitch:
      "Para el conjunto que quiere salir del Excel y del grupo de WhatsApp.",
    highlight: false,
  },
  gold: {
    name: "Oro",
    pitch:
      "Suma asambleas con votación, mantenimientos y grupo familiar por unidad.",
    highlight: true,
  },
  platinum: {
    name: "Platino",
    pitch:
      "Todo lo anterior más control de cartera, marketplace, locales y aliados.",
    highlight: false,
  },
};

const PLANS: PlanType[] = ["basic", "gold", "platinum"];

/** Mensajes de los códigos que devuelve el backend con `plans: null`. */
const ERROR_MESSAGES: Record<PricingErrorCode, string> = {
  MIN_APARTMENTS:
    "El número de unidades es menor al mínimo que podemos cotizar en línea. Escríbenos y lo revisamos contigo.",
  MONTHLY_NOT_ALLOWED_UNDER_30:
    "Las periodicidades semestral y anual aplican desde cierto número de unidades. Prueba con pago mensual o trimestral.",
  COUNTRY_DISABLED:
    "Todavía no tenemos tarifa publicada para este país. Escríbenos y te cotizamos.",
};

function formatPrice(value: number, locale?: string, currency?: string) {
  if (!locale || !currency) return String(value);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

/** El backend informa el descuento ya aplicado; el precio tachado se
 * reconstruye a partir de él para no inventar un "antes" que no existe. */
function getOriginalPrice(total: number, discount?: number) {
  if (!discount) return null;
  return Math.round(total / (1 - discount / 100));
}

export default function PlansPricing() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [apartments, setApartments] = useState<number>(60);
  const [billing, setBilling] = useState<BillingPeriod>("mensual");
  const [expanded, setExpanded] = useState<Record<PlanType, boolean>>({
    basic: false,
    gold: false,
    platinum: false,
  });

  const hasValidInput = apartments > 0;

  const { data, loading } = infoPayments(
    hasValidInput ? COUNTRY : "",
    hasValidInput ? apartments : 0,
    "",
    billing,
  );

  const plans = data?.plans ?? null;
  const errorMessage = data?.error ? ERROR_MESSAGES[data.error] : null;

  return (
    <div key={language} className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
      {/* ENCABEZADO */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-500" />
          <span className="text-sm font-medium">Precios públicos</span>
        </div>

        <Title as="h1" size="sm" font="bold" className="text-4xl md:text-5xl">
          Cuánto cuesta, sin tener que pedir una cotización
        </Title>

        <Text size="md" className="mt-5 leading-relaxed text-gray-500">
          El valor se calcula sobre el número de unidades de tu conjunto. Pon
          cuántas tiene y verás el precio exacto de cada plan, el mismo que
          aparece al momento de registrarte.
        </Text>
      </div>

      {/* COTIZADOR */}
      <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="w-full md:max-w-[240px]">
            <InputField
              regexType="number"
              id="apartments"
              type="number"
              min={1}
              label="Unidades del conjunto"
              placeholder="Ej. 120"
              value={apartments === 0 ? "" : String(apartments)}
              onChange={(event) =>
                setApartments(Number(event.target.value) || 0)
              }
            />
          </div>

          <div className="w-full">
            <Text size="sm" font="semi" className="mb-2">
              Periodicidad de pago
            </Text>

            <div className="flex flex-wrap gap-2">
              {BILLING_OPTIONS.map((option) => {
                const isActive = billing === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBilling(option.value)}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-700 text-white"
                        : "border border-black/10 bg-white/60 text-gray-600 hover:border-cyan-400/40"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-50 px-4 py-3">
            <Text size="sm" className="text-amber-800">
              {errorMessage}
            </Text>
          </div>
        )}
      </div>

      {/* PLANES */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PLANS.map((planKey) => {
          const meta = PLAN_META[planKey];
          const detail = plans?.[planKey] ?? null;
          const features = planFeatures[planKey];
          const isExpanded = expanded[planKey];
          const visibleFeatures = isExpanded ? features : features.slice(0, 6);
          const originalPrice = detail
            ? getOriginalPrice(detail.total, detail.discountApplied)
            : null;

          return (
            <div
              key={planKey}
              className={`relative flex flex-col rounded-[32px] border p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                meta.highlight
                  ? "border-cyan-400/40 bg-white/80 shadow-[0_25px_70px_rgba(6,182,212,.18)]"
                  : "border-black/5 bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,.08)]"
              }`}
            >
              {meta.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-cyan-700 px-4 py-1 text-xs font-bold text-white">
                  El más elegido
                </span>
              )}

              <Title as="h2" size="xs" font="bold" className="text-2xl">
                {meta.name}
              </Title>

              <Text size="sm" className="mt-2 leading-relaxed text-gray-500">
                {meta.pitch}
              </Text>

              {/* PRECIO */}
              <div className="mt-6 min-h-[92px]">
                {loading && (
                  <Text size="sm" className="text-gray-400">
                    Calculando…
                  </Text>
                )}

                {!loading && detail && (
                  <>
                    {originalPrice && (
                      <Text size="sm" className="text-gray-400 line-through">
                        {formatPrice(originalPrice, data?.locale, data?.currency)}
                      </Text>
                    )}

                    <Title as="h3" size="sm" font="bold" className="text-3xl">
                      {formatPrice(detail.total, data?.locale, data?.currency)}
                    </Title>

                    <Text size="xs" className="mt-1 text-gray-500">
                      Pago {billing} ·{" "}
                      {formatPrice(
                        detail.perApartment,
                        data?.locale,
                        data?.currency,
                      )}{" "}
                      por unidad
                    </Text>
                  </>
                )}

                {!loading && !detail && (
                  <Text size="sm" className="text-gray-400">
                    Indica las unidades del conjunto para ver el precio.
                  </Text>
                )}
              </div>

              {/* FUNCIONALIDADES */}
              <div className="mt-6 flex-1 space-y-2">
                {visibleFeatures.map((featureKey) => {
                  const baseKey = `plans_features.${planKey}.${featureKey}`;
                  const text = t(`${baseKey}.text`);
                  const tachado =
                    t(`${baseKey}.tachado`, { defaultValue: "false" }) ===
                    "true";

                  return (
                    <div key={featureKey} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600">✓</span>

                      <Text
                        size="sm"
                        className={tachado ? "text-gray-400 line-through" : ""}
                      >
                        {text}
                      </Text>
                    </div>
                  );
                })}

                {features.length > 6 && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [planKey]: !prev[planKey],
                      }))
                    }
                    className="mt-2 text-xs text-cyan-700 hover:underline"
                  >
                    {isExpanded
                      ? "Mostrar menos ▲"
                      : `+ ${features.length - 6} funcionalidades más ▼`}
                  </button>
                )}
              </div>

              <Button
                className="mt-7 w-full font-semibold"
                colVariant={meta.highlight ? "success" : "primary"}
                rounded="md"
                onClick={() => router.push(route.registerComplex)}
              >
                Empezar con {meta.name}
              </Button>
            </div>
          );
        })}
      </div>

      {/* CIERRE */}
      <div className="mt-12 rounded-[32px] border border-black/5 bg-white/60 p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-10">
        <Title as="h2" size="xs" font="bold" className="text-2xl">
          ¿Tu conjunto es muy grande, muy pequeño o administras varios?
        </Title>

        <Text size="sm" className="mx-auto mt-3 max-w-2xl text-gray-500">
          El cotizador cubre los casos estándar. Para empresas administradoras y
          conjuntos fuera de rango armamos el esquema contigo en la demostración.
        </Text>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            colVariant="success"
            rounded="md"
            onClick={() => router.push(route.demost)}
          >
            Agendar demostración
          </Button>

          <Button
            colVariant="primary"
            rounded="md"
            onClick={() => router.push(route.contact)}
          >
            Hablar con ventas
          </Button>
        </div>
      </div>
    </div>
  );
}
