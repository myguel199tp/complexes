"use client";

import { useLanguage } from "@/app/hooks/useLanguage";
import {
  InputField,
  SelectField,
  Button,
  TextAreaField,
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
      <section className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">
              Solicita una demostración de SmartPH
            </h1>

            <p className="text-cyan-100 text-lg">
              Descubre cómo automatizar la administración de tu conjunto
              residencial con nuestra plataforma todo en uno.
            </p>

            <ul className="space-y-2 text-cyan-100">
              <li>✔ Gestión financiera y contable</li>
              <li>✔ Comunicación con residentes</li>
              <li>✔ Control de visitantes y seguridad</li>
              <li>✔ Marketplace y reservas</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <h3 className="text-xl font-semibold mb-6">
              Agenda tu demostración
            </h3>

            <AlertFlag />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                placeholder="Nombre completo"
                inputSize="sm"
                regexType="alphanumeric"
                {...register("fullName")}
                rounded="md"
                errorMessage={errors.fullName?.message}
              />

              <InputField
                placeholder="Correo electrónico"
                type="email"
                regexType="email"
                {...register("email")}
                inputSize="sm"
                rounded="md"
                errorMessage={errors.email?.message}
              />

              <div className="block md:flex gap-3">
                <Controller
                  control={control}
                  name="indicative"
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      inputSize="sm"
                      rounded="md"
                      options={indicativeOptions}
                      defaultOption={t("indicativo")}
                      searchable
                      className="text-gray-800"
                      errorMessage={errors.indicative?.message}
                    />
                  )}
                />

                <InputField
                  placeholder={t("celular")}
                  inputSize="sm"
                  className="mt-2 md:!mt-0"
                  rounded="md"
                  {...register("phone")}
                  errorMessage={errors.phone?.message}
                />
              </div>

              <InputField
                placeholder="Nombre del conjunto residencial"
                inputSize="sm"
                rounded="md"
                {...register("nameUnit")}
                errorMessage={errors.nameUnit?.message}
              />

              <InputField
                placeholder="Cantidad de habitats en conjunto residencial"
                inputSize="sm"
                rounded="md"
                type="number"
                {...register("quantityUnits", {
                  valueAsNumber: true,
                })}
                errorMessage={errors.quantityUnits?.message}
              />

              <TextAreaField
                placeholder="Mensaje (opcional)"
                {...register("message")}
                rows={3}
                className="w-full bg-gray-200 text-gray-800 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <Button
                type="submit"
                size="full"
                colVariant="success"
                className="mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Agendar"}
              </Button>
            </form>

            <div className="text-sm text-gray-700 mt-2">
              Al enviar tus datos estás aceptando nuestra{" "}
              <button
                type="button"
                className="text-cyan-600 underline hover:text-cyan-500"
              >
                Política de Privacidad y términos y condiciones
              </button>
              .
            </div>
          </div>
        </div>
      </section>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-lg transition-all"
      >
        <FaWhatsapp size={22} />
        Hablar con un asesor
      </a>
    </main>
  );
}
