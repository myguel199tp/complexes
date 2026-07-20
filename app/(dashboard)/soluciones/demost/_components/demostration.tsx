"use client";

import { useState } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import {
  InputField,
  SelectField,
  Button,
  TextAreaField,
  Text,
  Title,
} from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { useFormDemostration } from "./use-form";
import { useRegisterOptions } from "./register-options";
import { AlertFlag } from "@/app/components/alertFalg";
import { Controller } from "react-hook-form";
import { FaWhatsapp } from "react-icons/fa";
import { infoPayments } from "@/app/(sets)/registers/_components/register-complex/info-payments";
import { countryMap } from "@/app/helpers/longitud-telefono";

function formatPrice(value: number, locale?: string, currency?: string) {
  if (!locale || !currency) return value.toLocaleString();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Demostration() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { indicativeOptions } = useRegisterOptions();

  const { register, errors, isSubmitting, handleSubmit, onSubmit, control } =
    useFormDemostration();

  // 🔵 PRECIO POR APARTAMENTO — mismo pricing del backend (país + cantidad)
  // Controles propios (no dependen del formulario de agendar).
  const [priceCountry, setPriceCountry] = useState("");
  const [priceApartments, setPriceApartments] = useState("");

  const priceCountryOptions = Object.entries(countryMap).map(
    ([name, code]) => ({
      value: code,
      label: name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    }),
  );

  const countryCode = priceCountry;
  const apartments = Number(priceApartments) || 0;

  const { data: pricing, loading: pricingLoading } = infoPayments(
    countryCode,
    apartments,
    "false",
    "mensual",
  );

  // Precio por apartamento de cada plan (Básico, Oro, Platino)
  const plansList = (
    [
      { key: "basic", label: "Básico" },
      { key: "gold", label: "Oro" },
      { key: "platinum", label: "Platino" },
    ] as const
  ).map((p) => {
    const plan = pricing?.plans?.[p.key];
    const perApt =
      plan && apartments > 0
        ? (plan.perApartment ?? Math.ceil(plan.total / apartments))
        : null;
    return { ...p, perApt };
  });

  const hasAnyPlan = plansList.some((p) => p.perApt != null);

  const showPriceBox = !!countryCode && apartments >= 10;

  const advisors = [
    "573003066369",
    "573246829832",
    "573007908880",
    "573044156317",
  ];

  const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];

  const whatsappUrl = `https://wa.me/${randomAdvisor}?text=Hola,%20quiero%20una%20demostración%20de%20SmartPH`;

  return (
    <main key={language} className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-10">
        <div className="max-w-6xl mx-auto  grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-2">
            <Title className="text-4xl font-bold leading-tight" size="sm">
              En solo 15 minutos descubre cómo SmartPH puede ayudarte
            </Title>

            <Text className="text-cyan-100 text-sm">
              ✅ Reducir el tiempo de administración hasta en un 70%.
            </Text>
            <Text className="text-cyan-100 text-sm">
              ✅ Controlar visitantes y accesos desde un solo lugar.
            </Text>
            <Text className="text-cyan-100 text-sm">
              ✅ Automatizar pagos, cartera y comunicación con residentes.{" "}
            </Text>
            <Text className="text-cyan-100 text-sm">
              ✅ Tener toda la información del conjunto en una sola
              plataforma.{" "}
            </Text>
            <hr />
            <Text size="sm">
              Calcula aquí el precio según tus inmuebles. Pero lo mejor lo verás
              en la demo: todo lo que incluye y cuánto puedes ahorrar. Agenda la
              tuya y déjanos tus datos.{" "}
            </Text>

            {/* 💲 PRECIO POR APARTAMENTO */}
            <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 space-y-3">
              {/* CONTROLES: país + cantidad de apartamentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800">
                <SelectField
                  inputSize="md"
                  defaultOption="País"
                  options={priceCountryOptions}
                  value={priceCountry}
                  onChange={(e) => setPriceCountry(e.target.value)}
                />
                <InputField
                  type="number"
                  inputSize="sm"
                  min={10}
                  placeholder="N° de apartamentos"
                  value={priceApartments}
                  onChange={(e) => setPriceApartments(e.target.value)}
                />
              </div>

              {!showPriceBox ? (
                <Text className="text-cyan-100 text-sm">
                  Elige el país y escribe el número de apartamentos (mín. 10)
                  para ver el precio por apartamento.
                </Text>
              ) : pricingLoading ? (
                <Text className="text-cyan-100 text-sm">
                  Calculando precio por apartamento...
                </Text>
              ) : hasAnyPlan ? (
                <>
                  <Text className="text-cyan-100 text-xs">
                    Precio promedio por apartamento / mes — para {apartments}{" "}
                    apartamentos
                  </Text>
                  <div className="grid grid-cols-3 gap-2">
                    {plansList.map((p) => (
                      <div
                        key={p.key}
                        className="rounded-lg bg-white/10 border border-white/20 p-2 text-center"
                      >
                        <Text className="text-cyan-100 text-xs">{p.label}</Text>
                        <p className="text-base sm:text-lg font-bold text-white leading-tight">
                          {p.perApt != null
                            ? formatPrice(
                                p.perApt,
                                pricing?.locale,
                                pricing?.currency,
                              )
                            : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Text className="text-cyan-100 text-[11px]">
                    El plan Básico está disponible desde 101 apartamentos.
                  </Text>
                </>
              ) : (
                <Text className="text-cyan-100 text-sm">
                  No hay precio disponible para el país seleccionado.
                </Text>
              )}
            </div>

            <Text className="text-cyan-100 text-sm font-medium">
              Agenda una demostración gratuita y conoce cómo funciona en tiempo
              real.
            </Text>
          </div>

          {/* FORM */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Agenda tu demostración
            </h3>

            <Text className="text-sm text-gray-600 mb-4">
              Te contactaremos en menos de 12 horas para coordinar tu demo en
              vivo.
            </Text>

            <AlertFlag />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* CONTACTO */}
              <InputField
                placeholder="Nombre completo"
                inputSize="sm"
                {...register("fullName")}
                errorMessage={errors.fullName?.message}
              />

              <InputField
                placeholder="Correo electrónico"
                type="email"
                inputSize="sm"
                {...register("email")}
                errorMessage={errors.email?.message}
              />

              <div className="flex gap-3">
                <Controller
                  control={control}
                  name="indicative"
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      inputSize="sm"
                      options={indicativeOptions}
                      defaultOption={t("indicativo")}
                      searchable
                      errorMessage={errors.indicative?.message}
                    />
                  )}
                />

                <InputField
                  placeholder={t("celular")}
                  inputSize="sm"
                  {...register("phone")}
                  errorMessage={errors.phone?.message}
                />
              </div>

              {/* CONTEXTO */}
              <InputField
                placeholder="Nombre del conjunto residencial"
                inputSize="sm"
                {...register("nameUnit")}
                errorMessage={errors.nameUnit?.message}
              />

              <InputField
                placeholder="Número de unidades / apartamentos"
                type="number"
                inputSize="sm"
                {...register("quantityUnits", { valueAsNumber: true })}
                errorMessage={errors.quantityUnits?.message}
              />

              <TextAreaField
                placeholder="Mensaje adicional (opcional)"
                className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("message")}
                rows={3}
              />

              <Button
                type="submit"
                size="full"
                colVariant="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Agendando..." : "Agendar demostración"}
              </Button>

              <Text className="text-xs text-gray-500 text-center mt-2">
                Al enviar aceptas nuestra política de privacidad y términos.
              </Text>
            </form>
          </div>
        </div>
      </section>

      {/* WHATSAPP FLOAT */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-6 z-50
          flex items-center gap-2
          bg-green-500 hover:bg-green-600
          text-white px-5 py-3 rounded-full shadow-lg
          transition-all hover:scale-105
        "
      >
        <FaWhatsapp size={22} />
        Hablar con un asesor
      </a>
    </main>
  );
}
