"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Button, InputField, Text, Title } from "complexes-next-components";
import { useRegisterStore } from "../store/registerStore";
import ModalRegisterComplex from "./modal/modal";
import { planFeatures } from "./plans-features";
import { useTranslation } from "react-i18next";
import { infoPayments } from "./info-payments";
import { useCountryOptions } from "./register-options";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PricingErrorCode } from "@/app/(sets)/registers/services/response/pricingResponse";
import { activeCampaignsService } from "@/app/(sets)/registers/services/campaignService";

type PlanType = "basic" | "gold" | "platinum";
type BillingPeriod = "mensual" | "semestral" | "anual";

/** El país está fijo mientras sólo se opere Colombia; cuando se abra otro
 * mercado basta con volver esto un selector alimentado por `useCountryOptions`. */
const COUNTRY = "CO";

/** Desde cuántos inmuebles se habilitan el plan básico y los periodos largos. */
const LONG_BILLING_MIN_APARTMENTS = 101;

const BILLING_OPTIONS: { value: BillingPeriod; label: string }[] = [
  { value: "mensual", label: "Mensual" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const PLAN_META: Record<PlanType, { pitch: string; highlight: boolean }> = {
  basic: {
    pitch:
      "Para el conjunto que quiere salir del Excel y del grupo de WhatsApp.",
    highlight: false,
  },
  gold: {
    pitch:
      "Suma asambleas con votación, mantenimientos y grupo familiar por unidad.",
    highlight: true,
  },
  platinum: {
    pitch:
      "Todo lo anterior más control de cartera, marketplace, locales y aliados.",
    highlight: false,
  },
};

const PLANS: PlanType[] = ["basic", "gold", "platinum"];

/** Cuántas funcionalidades se muestran antes de expandir la tarjeta. */
const VISIBLE_FEATURES = 6;

/** Mensajes de los códigos que devuelve el backend con `plans: null`. */
const ERROR_MESSAGES: Record<PricingErrorCode, string> = {
  MIN_APARTMENTS:
    "El número de unidades es menor al mínimo que podemos cotizar en línea. Escríbenos y lo revisamos contigo.",
  MONTHLY_NOT_ALLOWED_UNDER_30:
    "Las periodicidades semestral y anual aplican desde cierto número de unidades. Prueba con pago mensual.",
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

/** Estado del cupón. `checking` sólo existe mientras se valida contra el backend. */
type CouponState = "idle" | "checking" | "valid" | "invalid";

/** Longitud mínima que acepta el backend; por debajo no vale la pena preguntar. */
const MIN_COUPON_LENGTH = 3;

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apartment, setApartment] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billing, setBilling] = useState<BillingPeriod>("mensual");
  const [expanded, setExpanded] = useState<Record<PlanType, boolean>>({
    basic: false,
    gold: false,
    platinum: false,
  });

  /** Lo que hay escrito en la caja. */
  const [couponInput, setCouponInput] = useState("");
  /** Lo que ya se mandó a cotizar. Separado del input para no pedir precio en cada tecla. */
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponState, setCouponState] = useState<CouponState>("idle");

  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const isFounder = type === "fundador";
  const minApartments = isFounder ? 151 : 10;

  const { countryOptions } = useCountryOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const {
    showRegistTwo,
    setPrices,
    setPlan,
    setQuantity,
    setCurrency,
    setBillingPeriod,
    setCouponCode,
  } = useRegisterStore();

  const hasValidInput = apartment >= minApartments;

  const { data, loading } = infoPayments(
    hasValidInput ? COUNTRY : "",
    hasValidInput ? apartment : 0,
    type ?? "",
    billing,
    appliedCoupon,
  );

  /**
   * Un cupón vale para unos datos concretos: cambiar unidades o periodicidad
   * puede dejarlo por fuera. Por eso se revalida aquí y no en el clic del
   * botón, que se limita a proponer el código.
   */
  useEffect(() => {
    if (!appliedCoupon || !hasValidInput) return;

    let cancelled = false;

    setCouponState("checking");

    activeCampaignsService({
      country: COUNTRY,
      apartments: apartment,
      billing,
      coupon: appliedCoupon,
    })
      .then((result) => {
        if (cancelled) return;

        if (result.couponValid) {
          setCouponState("valid");
          setCouponCode(appliedCoupon);
          return;
        }

        // Un código que dejó de aplicar no se sigue mandando a cotizar: el
        // precio saldría igual y el usuario creería que le sirvió.
        setCouponState("invalid");
        setCouponCode("");
        setAppliedCoupon("");
      })
      .catch(() => {
        if (cancelled) return;

        setCouponState("invalid");
        setCouponCode("");
        setAppliedCoupon("");
      });

    return () => {
      cancelled = true;
    };
  }, [appliedCoupon, apartment, billing, hasValidInput, setCouponCode]);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (code.length < MIN_COUPON_LENGTH) {
      setCouponState("invalid");
      return;
    }

    if (code === appliedCoupon) return;

    setCouponState("checking");
    setAppliedCoupon(code);
  };

  const clearCoupon = () => {
    setCouponInput("");
    setAppliedCoupon("");
    setCouponState("idle");
    setCouponCode("");
  };

  /** Promociones que el backend alcanzó a aplicar a esta cotización. */
  const campaigns = data?.campaigns ?? [];

  const hasPricing = !!data?.plans && hasValidInput;
  const errorMessage = data?.error ? ERROR_MESSAGES[data.error] : null;

  const currency = useRegisterStore((s) => s.currency);

  useEffect(() => {
    const colombia = countryOptions.find((c) => c.value === COUNTRY);

    if (colombia?.currency && currency !== colombia.currency) {
      setCurrency(colombia.currency);
    }
  }, [countryOptions, currency, setCurrency]);

  return (
    <div key={language} className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      {/* ENCABEZADO */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <Link href="/complexes" className="flex items-center">
          <Image
            src="/nameImage.png"
            alt="globaliaph"
            width={470}
            height={313}
            priority
            sizes="(min-width: 1280px) 470px, 300px"
            className="h-auto w-[300px] select-none xl:w-[470px]"
          />
        </Link>

        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-500" />
            <span className="text-sm font-medium">Precios públicos</span>
          </div>

          <Title as="h1" size="sm" font="bold" className="text-3xl md:text-4xl">
            Gestiona tu propiedad horizontal fácilmente
          </Title>

          <div className="mt-3 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span>✔ Sin contratos ni ataduras</span>
            <span>✔ Cancelación cuando quieras</span>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          colVariant="success"
          size="md"
        >
          Continuar registro pendiente
        </Button>
      </div>

      {/* COTIZADOR */}
      <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-8">
        <Text size="sm" font="bold" className="mb-5">
          {t("indicacion")}
        </Text>

        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="w-full md:max-w-[240px]">
            <InputField
              regexType="number"
              id="apartments"
              label={t("cantidad")}
              placeholder="Ej. 120"
              rounded="md"
              inputSize="sm"
              value={apartment ? String(apartment) : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const qty = Number(value);
                setApartment(qty);
                setQuantity(qty);
                setSelectedPlan(null);
              }}
            />
          </div>

          <div className="w-full">
            <Text size="sm" font="semi" className="mb-2">
              Periodicidad de pago
            </Text>

            <div className="flex flex-wrap gap-2">
              {BILLING_OPTIONS.map((option) => {
                const isActive = billing === option.value;
                const isDisabled =
                  option.value !== "mensual" &&
                  apartment < LONG_BILLING_MIN_APARTMENTS;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;

                      setBilling(option.value);
                      setBillingPeriod(option.value);
                      setSelectedPlan(null);
                    }}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-700 text-white"
                        : "border border-black/10 bg-white/60 text-gray-600 hover:border-cyan-400/40"
                    } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <Text size="xs" className="mt-2 text-gray-500">
              Descuentos aplican solo a planes Gold y Platinum
            </Text>
          </div>
        </div>

        {/* CUPÓN */}
        <div className="mt-6 border-t border-black/5 pt-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:max-w-[260px]">
              <InputField
                id="coupon"
                label="¿Tienes un código de promoción?"
                placeholder="Ej. LANZA26"
                rounded="md"
                inputSize="sm"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());

                  // El aviso de "no aplica" era del código anterior; en cuanto
                  // lo cambian deja de ser cierto.
                  if (couponState === "invalid") setCouponState("idle");
                }}
              />
            </div>

            <Button
              type="button"
              colVariant="primary"
              size="md"
              rounded="md"
              disabled={!hasValidInput || couponState === "checking"}
              onClick={applyCoupon}
            >
              {couponState === "checking" ? "Validando…" : "Aplicar"}
            </Button>

            {couponState === "valid" && (
              <button
                type="button"
                onClick={clearCoupon}
                className="pb-2 text-sm text-gray-500 underline hover:text-gray-700"
              >
                Quitar
              </button>
            )}
          </div>

          {!hasValidInput && (
            <Text size="xs" className="mt-2 text-gray-500">
              Indica primero las unidades del conjunto para validar el código.
            </Text>
          )}

          {hasValidInput && couponState === "valid" && (
            <Text size="xs" className="mt-2 text-emerald-700">
              Código {appliedCoupon} aplicado. El precio de abajo ya lo incluye.
            </Text>
          )}

          {hasValidInput && couponState === "invalid" && (
            <Text size="xs" className="mt-2 text-amber-700">
              Ese código no aplica para este número de unidades o esta
              periodicidad.
            </Text>
          )}
        </div>

        {/* Promociones vivas: automáticas o por cupón, el backend ya las aplicó. */}
        {campaigns.length > 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-50 px-4 py-3">
            <Text size="sm" font="semi" className="text-emerald-800">
              🎉 {campaigns.map((campaign) => campaign.name).join(" · ")}
            </Text>

            <Text size="xs" className="mt-1 text-emerald-700">
              Ya está aplicada en los precios que ves abajo.
            </Text>
          </div>
        )}

        {apartment > 0 && apartment < LONG_BILLING_MIN_APARTMENTS && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white/60 px-4 py-3">
            <Text size="sm" className="text-gray-600">
              • Mínimo {minApartments} inmuebles.
              <br />• Para menos de {LONG_BILLING_MIN_APARTMENTS} inmuebles solo
              está disponible el pago mensual.
              <br />• No aplican descuentos por periodo.
            </Text>
          </div>
        )}

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
          const features = planFeatures[planKey];
          const isExpanded = expanded[planKey];
          const visibleFeatures = isExpanded
            ? features
            : features.slice(0, VISIBLE_FEATURES);

          const isSelected = selectedPlan === planKey;
          const isBasicDisabled =
            planKey === "basic" && apartment < LONG_BILLING_MIN_APARTMENTS;

          const detail =
            hasPricing && !isBasicDisabled
              ? (data?.plans?.[planKey] ?? null)
              : null;

          const isDisabled = !detail;

          const showDiscount =
            planKey !== "basic" &&
            billing !== "mensual" &&
            !!detail?.discountApplied;

          const hasCampaignDiscount = !!detail?.campaignDiscountAmount;
          const bonusMonths = detail?.campaignBonusMonths ?? 0;

          /**
           * Punto de partida del tachado: el precio antes de la promoción
           * —que el backend manda con impuesto ya incluido— y, si no hay
           * promoción, el precio final. Sobre eso se deshace el descuento por
           * periodicidad, de modo que el tachado sea el precio de lista y no un
           * peldaño intermedio.
           */
          const beforeCampaign = detail
            ? (hasCampaignDiscount
                ? detail.campaignTotalBefore
                : detail.total) ?? detail.total
            : 0;

          const originalPrice = detail
            ? showDiscount
              ? getOriginalPrice(beforeCampaign, detail.discountApplied)
              : hasCampaignDiscount
                ? beforeCampaign
                : null
            : null;

          /** El precio por unidad es una división, no un dato del backend. */
          const perApartment =
            detail && apartment > 0 ? detail.total / apartment : null;

          const selectPlan = () => {
            if (!detail) return;

            setSelectedPlan(planKey);
            setPrices(detail.total);
            setPlan(planKey);
          };

          return (
            <div
              key={planKey}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              onClick={selectPlan}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;

                event.preventDefault();
                selectPlan();
              }}
              className={`relative flex flex-col rounded-[32px] border p-7 backdrop-blur-xl transition-all duration-300 ${
                isSelected
                  ? "border-cyan-600 bg-cyan-50/80 shadow-[0_25px_70px_rgba(6,182,212,.25)] ring-2 ring-cyan-700"
                  : meta.highlight
                    ? "border-cyan-400/40 bg-white/80 shadow-[0_25px_70px_rgba(6,182,212,.18)]"
                    : "border-black/5 bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,.08)]"
              } ${
                isDisabled
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:-translate-y-1"
              }`}
            >
              {meta.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-cyan-700 px-4 py-1 text-xs font-bold text-white">
                  El más elegido
                </span>
              )}

              <Title
                as="h2"
                size="xs"
                font="bold"
                className="text-2xl capitalize"
              >
                {t(planKey)}
              </Title>

              <Text size="sm" className="mt-2 leading-relaxed text-gray-500">
                {meta.pitch}
              </Text>

              {/* PRECIO */}
              <div className="mt-6 min-h-[92px]">
                {loading && !detail && (
                  <Text size="sm" className="text-gray-400">
                    Calculando…
                  </Text>
                )}

                {detail && (
                  <>
                    {originalPrice && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Text size="sm" className="text-gray-400 line-through">
                          {formatPrice(
                            originalPrice,
                            data?.locale,
                            data?.currency,
                          )}
                        </Text>

                        {showDiscount && (
                          <span className="text-xs font-semibold text-green-600">
                            Ahorra {detail.discountApplied}%
                          </span>
                        )}

                        {hasCampaignDiscount && (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                            Promoción
                          </span>
                        )}
                      </div>
                    )}

                    <Title as="h3" size="sm" font="bold" className="text-3xl">
                      {formatPrice(detail.total, data?.locale, data?.currency)}

                      <span className="text-sm text-gray-500">
                        {" "}
                        / {t(billing)}
                      </span>
                    </Title>

                    {perApartment !== null && (
                      <Text size="xs" className="mt-1 text-gray-500">
                        {formatPrice(
                          Math.ceil(perApartment),
                          data?.locale,
                          data?.currency,
                        )}{" "}
                        por unidad
                      </Text>
                    )}

                    {/* Los meses de regalo no bajan el precio: alargan el periodo. */}
                    {bonusMonths > 0 && (
                      <Text
                        size="xs"
                        font="semi"
                        className="mt-1 text-emerald-700"
                      >
                        + {bonusMonths} {bonusMonths === 1 ? "mes" : "meses"}{" "}
                        gratis al activar
                      </Text>
                    )}
                  </>
                )}

                {!loading && !detail && (
                  <Text size="sm" className="text-gray-400">
                    {isBasicDisabled
                      ? `Disponible desde ${LONG_BILLING_MIN_APARTMENTS} inmuebles`
                      : "Indica las unidades del conjunto para ver el precio."}
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

                {features.length > VISIBLE_FEATURES && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpanded((prev) => ({
                        ...prev,
                        [planKey]: !prev[planKey],
                      }));
                    }}
                    className="mt-2 text-xs text-cyan-700 hover:underline"
                  >
                    {isExpanded
                      ? "Mostrar menos ▲"
                      : `+ ${features.length - VISIBLE_FEATURES} funcionalidades más ▼`}
                  </button>
                )}
              </div>

              <Button
                className="mt-7 w-full font-semibold"
                colVariant={isSelected ? "success" : "primary"}
                rounded="md"
                disabled={isDisabled}
                onClick={(event) => {
                  event.stopPropagation();
                  selectPlan();
                }}
              >
                {isSelected ? "Plan seleccionado" : `Elegir ${t(planKey)}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* CONTINUAR */}
      <div className="mt-10 flex justify-center">
        <Button
          disabled={!hasPricing || !selectedPlan}
          colVariant="success"
          size="full"
          rounded="md"
          onClick={showRegistTwo}
        >
          {t("siguiente")}
        </Button>
      </div>

      <ModalRegisterComplex
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
