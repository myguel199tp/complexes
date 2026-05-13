"use client";

import React, { useState, useEffect } from "react";
import {
  Avatar,
  Badge,
  Button,
  InputField,
  // SelectField,
  Text,
  Title,
} from "complexes-next-components";
import { useRegisterStore } from "../store/registerStore";
import ModalRegisterComplex from "./modal/modal";
import { planFeatures } from "./plans-features";
import { useTranslation } from "react-i18next";
import { infoPayments } from "./info-payments";
import { useCountryOptions } from "./register-options";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PlanType = "basic" | "gold" | "platinum";
type BillingPeriod = "mensual" | "semestral" | "anual";

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [country, setCountry] = useState("");
  const [country] = useState("CO");
  const [apartment, setApartment] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billing, setBilling] = useState<BillingPeriod>("mensual");

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
  } = useRegisterStore();

  const isValidApartments = apartment >= minApartments;
  const hasValidInput = !!country && isValidApartments;

  function formatPrice(value: number, locale?: string, currency?: string) {
    if (!locale || !currency) return value.toString();

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  }

  function getOriginalPrice(total: number, discount?: number) {
    if (!discount || discount === 0) return total;
    return Math.round(total / (1 - discount / 100));
  }

  const { data } = infoPayments(
    hasValidInput ? country : "",
    hasValidInput ? apartment : 0,
    type ?? "",
    billing,
  );

  const hasPricing = !!data && hasValidInput;

  const plans: PlanType[] = ["basic", "gold", "platinum"];

  const [expandedFeatures, setExpandedFeatures] = useState<
    Record<PlanType, boolean>
  >({
    basic: false,
    gold: false,
    platinum: false,
  });

  const renderFeatures = (plan: PlanType) => {
    const features = planFeatures[plan];
    const isExpanded = expandedFeatures[plan];

    const visibleFeatures = isExpanded ? features : features.slice(0, 4);

    return (
      <div className="mt-4 w-full">
        <div
          className={`space-y-2 transition-all
        ${isExpanded ? "max-h-40 overflow-y-auto pr-1" : "max-h-[120px] overflow-hidden"}
      `}
        >
          {visibleFeatures.map((featureKey, i) => {
            const baseKey = `plans_features.${plan}.${featureKey}`;

            const text = t(`${baseKey}.text`);

            const tachado =
              t(`${baseKey}.tachado`, { defaultValue: "false" }) === "true";

            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>

                <Text
                  size="sm"
                  className={tachado ? "line-through text-gray-400" : ""}
                >
                  {text}
                </Text>
              </div>
            );
          })}
        </div>

        {features.length > 4 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedFeatures((prev) => ({
                ...prev,
                [plan]: !prev[plan],
              }));
            }}
            className="text-xs text-cyan-700 hover:underline mt-2"
          >
            {isExpanded
              ? "Mostrar menos ▲"
              : `+ ${features.length - 4} funcionalidades más ▼`}
          </button>
        )}
      </div>
    );
  };

  const currency = useRegisterStore((s) => s.currency);

  useEffect(() => {
    const colombia = countryOptions.find((c) => c.value === "CO");

    if (colombia?.currency && currency !== colombia.currency) {
      setCurrency(colombia.currency);
    }
  }, [countryOptions, currency, setCurrency]);

  return (
    <div key={language} className="flex flex-col gap-6 items-center w-full">
      <section className="w-full max-w-7xl px-4">
        <div className="text-center items-center flex justify-between gap-4 my-2">
          <Link href="/complexes" className="flex items-center">
            <Avatar
              src="/complex.jpg"
              alt={"SmarPH"}
              size="xl"
              border="thick"
              shape="round"
            />
          </Link>
          <div>
            <Title as="h2" font="bold" size="sm">
              Gestiona tu propiedad horizontal fácilmente
            </Title>

            <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
              <span>✔ Sin contratos ni ataduras</span>
              <span>✔ Cancelación cuando quieras</span>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            colVariant="success"
            size="md"
          >
            Continuar registro pendiente
          </Button>
        </div>

        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <Text font="bold" size="md" className="text-leftr">
            {t("indicacion")}
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* <SelectField
              defaultOption={t("seleccionpais")}
              helpText={t("seleccionpais")}
              searchable
              regexType="letters"
              options={countryOptions}
              inputSize="lg"
              rounded="md"
              prefixImage="/world.png"
              onChange={(e) => {
                const selectedCode = e.target.value;
                setCountry(selectedCode);

                const selectedCountry = countryOptions.find(
                  (c) => c.value === selectedCode,
                );

                if (selectedCountry?.currency) {
                  setCurrency(selectedCountry.currency);
                }
              }}
            /> */}

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl blur-md opacity-70 group-focus-within:opacity-100 transition duration-300 animate-pulse" />

              <div className="relative bg-white rounded-xl">
                <InputField
                  placeholder={t("cantidad")}
                  helpText={t("cantidad")}
                  regexType="number"
                  rounded="md"
                  inputSize="sm"
                  value={apartment ? apartment.toString() : ""}
                  className="border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] focus:shadow-[0_0_25px_rgba(59,130,246,0.9)] focus:border-blue-500 transition-all duration-300"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const qty = Number(value);
                    setApartment(qty);
                    setQuantity(qty);
                    setSelectedPlan(null);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-center mt-6 mb-2">
                <div className="relative group">
                  {/* Glow exterior */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-md opacity-70 animate-pulse" />

                  {/* Contenedor */}
                  <div className="relative flex bg-white/80 backdrop-blur-md border border-cyan-200 rounded-2xl p-1.5 gap-2 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                    {[
                      { key: "mensual", label: "Mensual" },
                      { key: "semestral", label: "Semestral" },
                      { key: "anual", label: "Anual" },
                    ].map((item) => {
                      const disabled =
                        apartment < 101 &&
                        (item.key === "semestral" || item.key === "anual");

                      const active = billing === item.key;

                      return (
                        <button
                          key={item.key}
                          disabled={disabled}
                          onClick={() => {
                            if (disabled) return;

                            const period = item.key as BillingPeriod;
                            setBilling(period);
                            setBillingPeriod(period);
                          }}
                          className={`
              relative overflow-hidden px-5 py-2.5 text-sm rounded-xl
              transition-all duration-300 font-medium

              ${
                active
                  ? `
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    text-white
                    shadow-[0_0_20px_rgba(59,130,246,0.7)]
                    scale-105
                  `
                  : `
                    text-gray-600
                    hover:bg-cyan-50
                    hover:text-cyan-700
                    hover:shadow-md
                  `
              }

              ${
                disabled
                  ? "opacity-30 cursor-not-allowed grayscale"
                  : "cursor-pointer"
              }
            `}
                        >
                          {active && (
                            <span className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />
                          )}

                          <span className="relative z-10">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Text size="xs" className="text-gray-500 text-center mb-4">
                Descuentos aplican solo a planes Gold y Platinum
              </Text>
              {apartment > 0 && apartment < 101 && (
                <Text size="sm" colVariant="success" className="text-center">
                  • Mínimo 10 inmuebles.
                  <br />
                  • Para menos de 100 inmuebles solo está disponible el pago
                  mensual.
                  <br />• No aplican descuentos por periodo.
                </Text>
              )}
            </div>
          </div>

          {/* PLANES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {plans.map((planKey) => {
              const plan = data?.plans?.[planKey];
              const isSelected = selectedPlan === planKey;
              const isRecommended = planKey === "gold";

              const isBasicDisabled = apartment < 101 && planKey === "basic";

              const isDisabled = !hasPricing || isBasicDisabled;

              return (
                <div
                  key={planKey}
                  onClick={() => {
                    if (isDisabled || !plan) return;

                    setSelectedPlan(planKey);
                    setPrices(plan.total);
                    setPlan(planKey);
                  }}
                  className={`relative border rounded-2xl p-6 flex flex-col items-center text-center
                  transition
                  ${isSelected ? "ring-2 ring-cyan-700 bg-cyan-50" : "bg-white"}
                  ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-xl hover:scale-[1.02]"
                  }`}
                >
                  {isRecommended && (
                    <Badge
                      colVariant="success"
                      font="bold"
                      className="absolute -top-3"
                    >
                      ⭐ Más popular ⭐
                    </Badge>
                  )}

                  <Title size="sm" font="bold" className="capitalize">
                    {t(planKey)}
                  </Title>

                  <Text
                    size="lg"
                    font="bold"
                    className="mt-4 flex flex-col items-center gap-1"
                  >
                    {hasPricing && plan ? (
                      <>
                        {/* PRECIO ORIGINAL + AHORRO */}
                        {planKey !== "basic" &&
                          billing !== "mensual" &&
                          plan.discountApplied > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(
                                  getOriginalPrice(
                                    plan.total,
                                    plan.discountApplied,
                                  ),
                                  data?.locale,
                                  data?.currency,
                                )}
                              </span>

                              <span className="text-xs text-green-600 font-semibold">
                                Ahorra {plan.discountApplied}%
                              </span>
                            </div>
                          )}

                        {/* PRECIO FINAL */}
                        <span className="text-xl text-cyan-700">
                          {formatPrice(
                            plan.total,
                            data?.locale,
                            data?.currency,
                          )}

                          <span className="text-sm text-gray-500">
                            {" "}
                            / {t(billing)}
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">
                        Calculando precio...
                      </span>
                    )}
                  </Text>

                  {isBasicDisabled && (
                    <Text size="xs" className="text-red-500 mt-2">
                      Disponible desde 100 apartamentos
                    </Text>
                  )}

                  {renderFeatures(planKey)}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              disabled={!hasPricing || !selectedPlan}
              colVariant="success"
              size="full"
              onClick={showRegistTwo}
            >
              {t("siguiente")}
            </Button>
          </div>
        </div>
      </section>

      <ModalRegisterComplex
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
