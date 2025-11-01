"use client";

import React, { useEffect, useState } from "react";
import {
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

// 🔹 placeholder temporal de datos (estos deben venir del backend)

function formatPrice(value: number) {
  return `$ ${value?.toLocaleString("es-CO")}`;
}

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [country, setCountry] = useState("CO");
  const [apartment, setApartment] = useState<number>(0);
  const { countryOptions } = useCountryOptions();
  const billing = "mensual";

  // Llamada al backend
  const { data, loading, error } = infoPayments(country, apartment, billing);
  const plans = data?.plans ?? {
    basic: 0,
    gold: 0,
    platinum: 0,
  };

  const plansPerApartment = data?.perApartment ?? {
    basic: 0,
    gold: 0,
    platinum: 0,
  };

  useEffect(() => {
    if (data) {
      console.log("✅ Respuesta desde backend:", data);
    }
  }, [data]);

  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "gold" | "platinum" | null
  >(null);

  const { showRegistTwo, setPrices, setPlan, setQuantity } = useRegisterStore();

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const { t } = useTranslation();

  const renderFeatures = (plan: "basic" | "gold" | "platinum") => {
    return (
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
  };

  const numericValue = apartment;
  const selectedOption = countryOptions.find((opt) => opt.value === country);

  return (
    <div className="flex flex-col md:!flex-row gap-5 w-full justify-center items-center">
      <section className="rounded-lg p-4 w-full">
        <Flag
          colVariant="warning"
          background="warning"
          size="md"
          className="mt-2"
          rounded="lg"
        >
          <div className="flex gap-4">
            <GoAlertFill size={30} />
            <Text
              size="sm"
              colVariant="default"
              font="semi"
              tKey={t("messageregister")}
            >
              Incluir los perfiles de los trabajadores que usarán la aplicación:
              por defecto, celador y administrador. Si hay más trabajadores,
              deben agregarse como perfiles adicionales, contándolos como
              apartamentos extra para su creación.
            </Text>
          </div>
        </Flag>
        <div className="border-2 p-5 rounded-md mt-3 w-full">
          {/* País */}
          <Text className="mt-2" size="md" font="bold">
            {t("seleccionpais")}
          </Text>

          <div
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              if (target.tagName === "INPUT") {
                target.value = target.value.replace(
                  /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                  ""
                );
              }
            }}
          >
            <SelectField
              helpText={t("seleccionpais")}
              searchable
              sizeHelp="sm"
              tKeyDefaultOption={t("seleccionpais")}
              onChange={(e) => setCountry(e.target.value)}
              value={country}
              options={countryOptions}
              prefixImage={selectedOption?.image || ""}
            />
          </div>

          {/* Apartamentos */}
          <Text className="mt-2" size="md" font="bold">
            {t("indicacion")}
          </Text>
          <InputField
            sizeHelp="sm"
            placeholder={t("cantidad")}
            helpText={t("cantidad")}
            className="mt-2"
            rounded="md"
            value={apartment ? apartment.toString() : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setApartment(Number(value));
              setQuantity(Number(value));
            }}
          />

          {/* Mostrar error si aplica */}
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
              {/* BASIC */}
              <div
                className={`rounded-xl border p-6 transition-all duration-300 ease-in-out shadow-md  cursor-pointer ${
                  selectedPlan === "basic"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedPlan("basic");
                  setPrices(plans.basic);
                  setPlan("basic");
                }}
              >
                <div className="w-full justify-center items-center p-2 rounded-lg shadow-md bg-blue-200/50 backdrop-blur-xl border border-blue-300/40">
                  <Title font="bold" size="md">
                    {t("basico")}
                  </Title>
                  <Text size="lg" font="bold" className="text-2xl mb-1">
                    Total: {formatPrice(plans.basic)} {t("mensual")}
                  </Text>
                  <Tooltip
                    className="bg-gray-200 w-[170px]"
                    content="Este es el precio que tendría que pagar cada inmueble"
                  >
                    <Text size="sm" font="semi" className="text-gray-600 mb-4">
                      {t("inmueble")}: {formatPrice(plansPerApartment.basic)}
                    </Text>
                  </Tooltip>
                </div>
                {renderFeatures("basic")}
              </div>

              {/* GOLD */}
              <div
                className={`rounded-xl border p-6 transition-all duration-300 ease-in-out shadow-md  cursor-pointer ${
                  selectedPlan === "gold"
                    ? "ring-2 ring-yellow-500 bg-yellow-50"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedPlan("gold");
                  setPrices(plans.gold);
                  setPlan("gold");
                }}
              >
                <div className="w-full justify-center items-center p-2 rounded-lg shadow-md bg-yellow-200/50 backdrop-blur-xl border border-yellow-300/40">
                  <Title font="bold" size="md">
                    {t("oro")}
                  </Title>
                  <Text size="lg" font="bold" className="text-2xl mb-1">
                    Total: {formatPrice(plans.gold)} {t("mensual")}
                  </Text>
                  <Tooltip
                    className="bg-gray-200 w-[170px]"
                    content="Este es el precio que tendría que pagar cada inmueble"
                  >
                    <Text size="sm" font="semi" className="text-gray-600 mb-4">
                      {t("inmueble")}: {formatPrice(plansPerApartment.gold)}
                    </Text>
                  </Tooltip>
                </div>
                {renderFeatures("gold")}
              </div>

              {/* PLATINUM */}
              <div
                className={`rounded-xl border p-6 transition-all duration-300 ease-in-out shadow-md  cursor-pointer ${
                  selectedPlan === "platinum"
                    ? "ring-2 ring-slate-600 bg-gray-100"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedPlan("platinum");
                  setPrices(plans.platinum);
                  setPlan("platinum");
                }}
              >
                <div className="w-full justify-center items-center p-2 rounded-lg shadow-md bg-slate-300/50 backdrop-blur-xl border border-slate-300/40">
                  <Title font="bold" size="md">
                    {t("plation")}
                  </Title>
                  <Text size="lg" font="bold" className="text-2xl mb-1">
                    Total: {formatPrice(plans.platinum)} {t("mensual")}
                  </Text>
                  <Tooltip
                    className="bg-gray-300 w-[170px]"
                    content="Este es el precio que tendría que pagar cada inmueble"
                  >
                    <Text size="sm" font="semi" className="text-gray-700 mb-4">
                      {t("inmueble")}: {formatPrice(plansPerApartment.platinum)}
                    </Text>
                  </Tooltip>
                </div>

                {renderFeatures("platinum")}
              </div>
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
              <Text size="md" tKey={t("lacantidad")}>
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
