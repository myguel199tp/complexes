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

export default function Demostration() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { indicativeOptions } = useRegisterOptions();

  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    control,
  } = useFormDemostration();
  return (
    <main key={language} className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">
              Solicita una demostración de ComplexesPH
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

          {/* Formulario */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12">
            <h3 className="text-xl font-semibold mb-6">
              Agenda tu demostración
            </h3>
            <AlertFlag />
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                placeholder="Nombre completo"
                inputSize="sm"
                regexType="alphanumeric"
                {...register("fullName")}
                rounded="lg"
                errorMessage={errors.fullName?.message}
              />

              <InputField
                placeholder="Correo electrónico"
                type="email"
                regexType="email"
                {...register("email")}
                inputSize="sm"
                rounded="lg"
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
                      rounded="lg"
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
                  rounded="lg"
                  {...register("phone", {
                    required: t("celularRequerido"),
                    pattern: {
                      value: /^[0-9]+$/,
                      message: t("soloNumeros"),
                    },
                  })}
                  errorMessage={errors.phone?.message}
                />
              </div>

              <InputField
                placeholder="Nombre del conjunto residencial"
                inputSize="sm"
                rounded="lg"
                {...register("nameUnit")}
                errorMessage={errors.nameUnit?.message}
              />
              <InputField
                placeholder="Cantidad de habitats en conjunto residencial"
                inputSize="sm"
                rounded="lg"
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
                colVariant="warning"
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
                onClick={() => {}}
                className="text-cyan-600 underline hover:text-cyan-500 transition-colors duration-200"
              >
                Política de Privacidad y términos y condiciones
              </button>
              .
            </div>
          </div>
        </div>
      </section>

      {/* QUE INCLUYE */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">
            ¿Qué incluye la demostración?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Tour completo del sistema</h4>
              <p className="text-gray-600">
                Conoce todas las funcionalidades que ofrece ComplexesPH.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Asesoría personalizada</h4>
              <p className="text-gray-600">
                Evaluamos las necesidades específicas de tu conjunto.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Resolución de dudas</h4>
              <p className="text-gray-600">
                Nuestro equipo responderá todas tus preguntas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
