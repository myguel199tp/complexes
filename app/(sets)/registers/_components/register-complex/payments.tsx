"use client";

import React, { useEffect, useState } from "react";
import {
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
import { GoAlertFill } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { infoPayments } from "./info-payments";
import { useCountryOptions } from "./register-options";
import { useLanguage } from "@/app/hooks/useLanguage";

/* =========================
   Utils
========================= */

function formatPrice(value: number, locale?: string, currency?: string) {
  if (!locale || !currency) return value.toString();

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

/* =========================
   Component
========================= */

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [apartment, setApartment] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "gold" | "platinum" | null
  >(null);

  const billing = "mensual";
  const { countryOptions } = useCountryOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { showRegistTwo, setPrices, setPlan, setQuantity } = useRegisterStore();

  /* =========================
     Backend call
  ========================= */

  const { data, loading, error } = infoPayments(country, apartment, billing);

  useEffect(() => {
    if (data) {
      console.log("✅ Respuesta desde backend:", data);
    }
  }, [data]);

  const numericValue = apartment;
  const selectedOption = null;

  /* =========================
     Render helpers
  ========================= */

  const renderFeatures = (plan: "basic" | "gold" | "platinum") => (
    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
      {planFeatures[plan].map((featureKey, i) => {
        const text = t(`plans_features.${plan}.${featureKey}.text`);
        const tooltip = t(`plans_features.${plan}.${featureKey}.tooltip`);
        const tachado =
          t(`plans_features.${plan}.${featureKey}.tachado`, {
            defaultValue: "false",
          }) === "true";

        return (
          <li key={i}>
            <Tooltip
              className="bg-gray-200 w-full"
              content={tooltip || t("sinDescripcion")}
            >
              <Text
                size="md"
                className={tachado ? "line-through text-gray-500" : ""}
              >
                {text}
              </Text>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );

  /* =========================
     JSX
  ========================= */

  return (
    <div
      key={language}
      className="flex flex-col md:flex-row gap-5 w-full justify-center items-center"
    >
      <section className="rounded-lg p-4 w-full">
        <Flag
          colVariant="default"
          background="warning"
          size="sm"
          className="mt-2"
          rounded="lg"
        >
          <div className="flex gap-4 items-center">
            <GoAlertFill size={30} />
            <Text size="md" font="semi">
              {t("messageregister")}
            </Text>
          </div>
        </Flag>

        <div className="border-2 p-5 rounded-md mt-3 w-full">
          {/* País */}
          <div className="flex justify-between mt-2">
            <Text size="md" font="bold">
              {t("seleccionpais")}
            </Text>
            <Buton
              colVariant="primary"
              borderWidth="none"
              className="my-2"
              onClick={() => setIsModalOpen(true)}
            >
              {t("continueRegistro")}
            </Buton>
          </div>

          <SelectField
            defaultOption={t("seleccionpais")}
            searchable
            sizeHelp="xs"
            options={countryOptions}
            inputSize="md"
            rounded="md"
            onChange={(e) => setCountry(e.target.value)}
            prefixImage={selectedOption ?? "/world.png"}
          />

          {/* Apartamentos */}
          <Text className="mt-2" size="md" font="bold">
            {t("indicacion")}
          </Text>

          <InputField
            sizeHelp="sm"
            placeholder={t("cantidad")}
            className="mt-2"
            rounded="md"
            value={apartment ? apartment.toString() : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setApartment(Number(value));
              setQuantity(Number(value));
            }}
          />

          {/* Error */}
          {error && (
            <Flag
              colVariant="danger"
              background="danger"
              size="sm"
              className="mt-2"
              rounded="lg"
            >
              <Text size="sm">{error}</Text>
            </Flag>
          )}

          {/* Planes */}
          <Text className="mt-2" size="md" font="bold">
            {t("plans")}
          </Text>

          {loading && <Text>{t("cargando")}...</Text>}

          {!loading && data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {(["basic", "gold", "platinum"] as const).map((planKey) => {
                const plan = data.plans[planKey];
                const isSelected = selectedPlan === planKey;

                return (
                  <div
                    key={planKey}
                    className={`rounded-xl border p-6 shadow-md cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-cyan-800 bg-cyan-50"
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setSelectedPlan(planKey);
                      setPrices(plan.total);
                      setPlan(planKey);
                    }}
                  >
                    <Title font="bold" size="sm">
                      {t(planKey)}
                    </Title>

                    <Text size="lg" font="bold" className="mt-4">
                      {formatPrice(plan.total, data.locale, data.currency)}{" "}
                      <span className="text-sm font-normal text-gray-600">
                        {data.currency}
                      </span>{" "}
                      / {t("mensual")}
                    </Text>
                    <Tooltip
                      className="bg-gray-200 w-[170px]"
                      content="Precio por inmueble"
                    >
                      <Text size="sm">
                        {t("inmueble")}:{" "}
                        {formatPrice(
                          plan.perApartment,
                          data.locale,
                          data.currency
                        )}
                      </Text>
                    </Tooltip>

                    {renderFeatures(planKey)}
                  </div>
                );
              })}
            </div>
          )}

          {/* Botón siguiente */}
          <div className="flex justify-center mt-4">
            <Button
              disabled={numericValue <= 9 || !selectedPlan}
              colVariant="warning"
              size="full"
              onClick={showRegistTwo}
            >
              {t("siguiente")}
            </Button>
          </div>

          {numericValue <= 9 && numericValue !== 0 && (
            <Flag
              colVariant="danger"
              background="danger"
              size="sm"
              className="mt-2"
              rounded="lg"
            >
              <Text size="md">
                La cantidad de inmuebles debe ser superior o igual a 10
              </Text>
            </Flag>
          )}
        </div>
      </section>

      <ModalRegisterComplex
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
