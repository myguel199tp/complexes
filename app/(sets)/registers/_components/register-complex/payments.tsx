"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  InputField,
  SelectField,
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

type PlanType = "basic" | "gold" | "platinum";
type BillingPeriod = "mensual" | "semestral" | "anual";

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

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState("");
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
      <div className="mt-4 space-y-2 w-full">
        {visibleFeatures.map((featureKey, i) => {
          const text = t(`plans_features.${plan}.${featureKey}.text`);

          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <Text size="sm">{text}</Text>
            </div>
          );
        })}

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

  return (
    <div key={language} className="flex flex-col gap-6 items-center w-full">
      <section className="w-full max-w-7xl px-4">
        {/* HEADER */}
        <div className="text-center my-2">
          <Title as="h2" font="bold" size="sm">
            Gestiona tu propiedad horizontal fácilmente
          </Title>

          <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
            <span>✔ Sin contratos ni ataduras</span>
            <span>✔ Cancelación cuando quieras</span>
          </div>
        </div>

        {/* CALCULADORA */}
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          {/* SELECTORES */}

          <Text font="bold" size="sm" className="text-center">
            {t("indicacion")}
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <SelectField
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
            />

            <InputField
              placeholder={t("cantidad")}
              helpText={t("cantidad")}
              regexType="number"
              rounded="md"
              inputSize="sm"
              value={apartment ? apartment.toString() : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const qty = Number(value);
                setApartment(qty);
                setQuantity(qty);
                setSelectedPlan(null);
              }}
            />

            <div>
              <div className="flex justify-center mt-6 mb-2">
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {[
                    { key: "mensual", label: "Mensual" },
                    { key: "semestral", label: "Semestral" },
                    { key: "anual", label: "Anual" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        const period = item.key as BillingPeriod;
                        setBilling(period);
                        setBillingPeriod(period);
                      }}
                      className={`px-4 py-2 text-sm rounded-lg transition ${
                        billing === item.key
                          ? "bg-white shadow font-semibold text-cyan-700"
                          : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <Text size="xs" className="text-gray-500 text-center mb-4">
                Descuentos aplican solo a planes Gold y Platinum
              </Text>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {plans.map((planKey) => {
              const plan = data?.plans?.[planKey];
              const isSelected = selectedPlan === planKey;
              const isRecommended = planKey === "gold";
              const isDisabled = !hasPricing;

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
                    transition hover:shadow-xl hover:scale-[1.02]
                    ${isSelected ? "ring-2 ring-cyan-700 bg-cyan-50" : "bg-white"}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                        <span className="text-xl">
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
                      <span className="text-gray-400">Calcula el precio</span>
                    )}
                  </Text>

                  {renderFeatures(planKey)}
                </div>
              );
            })}
          </div>

          {/* BOTON */}
          <div className="flex justify-center mt-8">
            <Button
              disabled={!hasPricing || !selectedPlan}
              colVariant="warning"
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
