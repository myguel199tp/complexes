"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Flag,
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

function formatPrice(value: number, locale?: string, currency?: string) {
  if (!locale || !currency) return value.toString();

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [apartment, setApartment] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const billing = "mensual";

  const isFounder = type === "fundador";
  const minApartments = isFounder ? 151 : 10;

  const { countryOptions } = useCountryOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { showRegistTwo, setPrices, setPlan, setQuantity, setCurrency } =
    useRegisterStore();

  const isValidApartments = apartment >= minApartments;
  const hasValidInput = !!country && isValidApartments;

  const { data, error } = infoPayments(
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
        <div className="text-center mb-1">
          <Title as="h2" font="bold" size="sm">
            Gestiona tu propiedad horizontal fácilmente
          </Title>

          <Badge
            colVariant="on"
            background="citian"
            size="sm"
            font="bold"
            rounded="lg"
            className="my-4"
          >
            Calcula el costo según el tamaño de tu conjunto y elige el plan
            ideal
          </Badge>

          <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
            <span>✔ Sin contratos ni ataduras</span>
            <span>✔ Cancelación cuando quieras</span>
          </div>

          <div className="flex flex-col items-center mt-2 border rounded-lg p-4 bg-gray-50">
            <Text size="xs" className="text-gray-600">
              ¿Ya habías empezado tu registro?
            </Text>

            <Button
              colVariant="primary"
              size="sm"
              className="mt-2"
              onClick={() => setIsModalOpen(true)}
            >
              {t("continueRegistro")}
            </Button>
          </div>
        </div>

        {/* CALCULADORA */}
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <SelectField
              defaultOption={t("seleccionpais")}
              searchable
              regexType="letters"
              options={countryOptions}
              inputSize="md"
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

            <Badge
              colVariant="primary"
              font="bold"
              size="md"
              className="text-center"
            >
              {t("indicacion")}
            </Badge>

            <InputField
              placeholder={t("cantidad")}
              regexType="number"
              rounded="md"
              value={apartment ? apartment.toString() : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const qty = Number(value);
                setApartment(qty);
                setQuantity(qty);
                setSelectedPlan(null);
              }}
            />
          </div>

          {error && (
            <Flag colVariant="danger" background="danger" className="mt-2">
              <Text size="sm">{error}</Text>
            </Flag>
          )}

          {!isFounder && apartment > 0 && apartment < 10 && (
            <Flag colVariant="danger" background="danger" className="mt-2">
              <Text size="sm">
                La cantidad de inmuebles debe ser mayor o igual a 10
              </Text>
            </Flag>
          )}

          {isFounder && apartment > 0 && apartment <= 150 && (
            <Flag colVariant="danger" background="danger" className="mt-2">
              <Text size="sm">
                Para registros como <b>fundador</b>, la cantidad de inmuebles
                debe ser superior a 150
              </Text>
            </Flag>
          )}

          {!hasPricing && hasValidInput && (
            <Text className="text-center text-gray-500 mt-2">
              Calculando precios...
            </Text>
          )}

          {/* PLANES */}
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
                  className={`
                    relative border rounded-2xl p-6 flex flex-col items-center text-center
                    transition hover:shadow-xl hover:scale-[1.02]
                    ${isSelected ? "ring-2 ring-cyan-700 bg-cyan-50" : "bg-white"}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
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

                  <Text size="lg" font="bold" className="mt-4">
                    {hasPricing && plan ? (
                      <>
                        {formatPrice(plan.total, data?.locale, data?.currency)}
                        <span className="text-sm text-gray-500">
                          {" "}
                          / {t("mensual")}
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

          {/* BOTON SIGUIENTE */}
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
