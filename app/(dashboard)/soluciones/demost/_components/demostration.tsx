"use client";

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

export default function Demostration() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { indicativeOptions } = useRegisterOptions();

  const { register, errors, isSubmitting, handleSubmit, onSubmit, control } =
    useFormDemostration();

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
            <Text>
              Los precios varian según la cantidad de inmuebles que tenga el
              conjunto{" "}
            </Text>

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
