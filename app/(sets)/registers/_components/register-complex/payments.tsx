// "use client";

import React, { useState } from "react";
import {
  Badge,
  Buton,
  Button,
  Flag,
  InputField,
  SelectField,
  Text,
  Title,
  Tooltip,
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
  const type = searchParams.get("type"); // fundador | null
  const billing = "mensual";

  const isFounder = type === "fundador";
  const minApartments = isFounder ? 151 : 10;

  const { countryOptions } = useCountryOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { showRegistTwo, setPrices, setPlan, setQuantity, setCurrency } =
    useRegisterStore();

  /**
   * ✅ Validación principal
   */
  const hasValidInput = !!country && apartment >= minApartments;

  /**
   * 👉 SOLO se cotiza si pasa validación
   */
  const { data, error } = infoPayments(
    hasValidInput ? country : "",
    hasValidInput ? apartment : 0,
    type ?? "",
    billing
  );

  const hasPricing = !!data && hasValidInput;

  /**
   * 👉 BASIC deshabilitado cuando viene type
   */
  const isBasicDisabled = !!type;

  const plans: PlanType[] = ["basic", "gold", "platinum"];

  const renderFeatures = (plan: PlanType) => (
    <div className="mt-4 space-y-3 w-full">
      {planFeatures[plan].map((featureKey, i) => {
        const text = t(`plans_features.${plan}.${featureKey}.text`);
        const tooltip = t(`plans_features.${plan}.${featureKey}.tooltip`);
        const tachado =
          t(`plans_features.${plan}.${featureKey}.tachado`, {
            defaultValue: "false",
          }) === "true";

        return (
          <Tooltip
            key={i}
            content={tooltip || t("sinDescripcion")}
            className="bg-gray-500"
          >
            <div
              className={`flex items-start gap-3 rounded-xl px-4 py-3
                ${tachado ? "bg-gray-100 opacity-60" : "bg-white shadow-sm"}
              `}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm
                  ${
                    tachado
                      ? "bg-gray-300 text-gray-500"
                      : "bg-emerald-100 text-emerald-600"
                  }
                `}
              >
                {tachado ? "—" : "✓"}
              </div>

              <Text
                size="sm"
                className={`leading-snug ${
                  tachado
                    ? "line-through text-gray-500"
                    : "text-gray-800 font-medium"
                }`}
              >
                {text}
              </Text>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );

  return (
    <div
      key={language}
      className="flex flex-col gap-5 w-full justify-center items-center"
    >
      <section className="rounded-lg p-4 w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Title as="h3" size="sm" font="bold">
            Beneficios exclusivos por Nivel de membresía
          </Title>

          <Text size="xs">
            Los conjuntos que forman parte del club acceden a beneficios
            diferenciados según su nivel
          </Text>

          <div className="flex justify-between mt-1 items-center gap-4">
            <Text size="xs" font="bold">
              Básico - Oro - Platino
            </Text>

            <Buton
              colVariant="primary"
              borderWidth="none"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              {t("continueRegistro")}
            </Buton>
          </div>
        </div>

        {/* Form */}
        <div className="border-2 p-5 rounded-md mt-4 w-full">
          <div className="flex flex-col md:!flex-row items-center gap-4">
            <div className="w-full md:!w-[20%]">
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
                    (c) => c.value === selectedCode
                  );

                  if (selectedCountry?.currency) {
                    setCurrency(selectedCountry.currency);
                  }
                }}
              />
            </div>

            <div className="w-full md:!w-[60%]">
              <Text size="md" font="bold">
                {t("indicacion")}
              </Text>
            </div>

            <div className="w-full md:!w-[20%]">
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
          </div>

          {/* Error API */}
          {error && (
            <Flag
              colVariant="danger"
              background="danger"
              size="sm"
              className="mt-2"
            >
              <Text size="sm">{error}</Text>
            </Flag>
          )}

          {/* Validaciones */}
          {!isFounder && apartment > 0 && apartment < 10 && (
            <Flag
              colVariant="danger"
              background="danger"
              size="xs"
              className="mt-2"
            >
              <Text size="sm">
                La cantidad de inmuebles debe ser mayor o igual a 10
              </Text>
            </Flag>
          )}

          {isFounder && apartment > 0 && apartment <= 150 && (
            <Flag
              colVariant="danger"
              background="danger"
              size="xs"
              className="mt-2"
            >
              <Text size="sm">
                Para registros como <b>fundador</b>, la cantidad de inmuebles
                debe ser superior a 150
              </Text>
            </Flag>
          )}

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {plans.map((planKey) => {
              const plan = data?.plans?.[planKey];
              const isSelected = selectedPlan === planKey;
              const isDisabled =
                !hasPricing || (planKey === "basic" && isBasicDisabled);

              return (
                <div
                  key={planKey}
                  className={`rounded-xl border p-6 shadow-md transition-all
                    flex flex-col items-center text-center
                    ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    ${
                      isSelected
                        ? "ring-2 ring-cyan-800 bg-cyan-50"
                        : "bg-white"
                    }
                  `}
                  onClick={() => {
                    if (isDisabled || !plan) return;
                    setSelectedPlan(planKey);
                    setPrices(plan.total);
                    setPlan(planKey);
                  }}
                >
                  <Title font="bold" size="md" className="capitalize">
                    {t(planKey)}
                  </Title>

                  {planKey === "basic" && isBasicDisabled && (
                    <Badge colVariant="warning" size="xs" className="mt-2">
                      No disponible en este registro
                    </Badge>
                  )}

                  <Text size="lg" font="bold" className="mt-4">
                    {hasPricing && plan ? (
                      <>
                        {formatPrice(plan.total, data.locale, data.currency)}{" "}
                        <span className="text-sm font-normal text-gray-600">
                          / {t("mensual")}
                        </span>
                        {isFounder && (
                          <div className="mt-2">
                            <Flag
                              colVariant="primary"
                              background="primary"
                              rounded="md"
                            >
                              <Text size="xs">
                                Este plan cuenta con un 15% de descuento para
                                fundadores, ya aplicado de forma permanente.
                              </Text>
                            </Flag>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">
                        Ingresa país y cantidad
                      </span>
                    )}
                  </Text>

                  {renderFeatures(planKey)}
                </div>
              );
            })}
          </div>

          {/* Next */}
          <div className="flex justify-center mt-6">
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
