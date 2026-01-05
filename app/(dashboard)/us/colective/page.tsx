"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const handleRegister = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <header
        key={language}
        className="flex items-center justify-between rounded-xl bg-cyan-800 px-5 py-4 shadow"
      >
        <Title size="xs" font="bold" className="text-white">
          Protección colectiva frente a la morosidad
        </Title>

        <Button
          colVariant="warning"
          className="flex items-center gap-2"
          onClick={handleRegister}
          disabled={isPending}
        >
          {t("inscripcion")}
          {isPending && <ImSpinner9 className="animate-spin" />}
        </Button>
      </header>

      {/* Introducción */}
      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
        <Text>
          COMPLEXESPHCLUB no realiza cobros de cartera ni garantiza pagos. Su
          rol es preventivo, estructural y comunitario.
        </Text>

        <Text className="text-gray-600">
          El club implementa reglas comunes, alertas tempranas, reportes
          comparativos y mecanismos de presión institucional legítima,
          orientados a reducir la morosidad sin recurrir a acciones legales ni
          cobro directo.
        </Text>
      </div>

      {/* Herramientas comunes */}
      <div className="rounded-xl border bg-gray-50 p-5 shadow-sm space-y-3">
        <Title size="sm" font="bold">
          Enfoque preventivo del ecosistema
        </Title>

        <ul className="space-y-2">
          <li className="flex gap-2">
            <span>✔</span>
            <Text>Alertas tempranas sobre niveles de morosidad.</Text>
          </li>
          <li className="flex gap-2">
            <span>✔</span>
            <Text>Comunicación estructurada con residentes.</Text>
          </li>
          <li className="flex gap-2">
            <span>✔</span>
            <Text>
              Presión institucional basada en transparencia y participación.
            </Text>
          </li>
        </ul>
      </div>

      {/* Planes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Básico */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
          <Title size="sm" font="bold">
            🩵 Plan Básico
          </Title>

          <Text>
            Acceso a mecanismos esenciales de prevención de morosidad, enfocados
            en visibilidad y comunicación.
          </Text>

          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <Text>Alertas generales de morosidad.</Text>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <Text>Reportes básicos de comportamiento de cartera.</Text>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <Text>Comunicados informativos estándar.</Text>
            </li>
          </ul>
        </div>

        {/* Oro */}
        <div className="rounded-xl border bg-yellow-50 p-5 shadow-sm space-y-3">
          <Title size="sm" font="bold">
            🟡 Plan Oro
          </Title>

          <Text>
            Nivel intermedio de control preventivo, con mayor capacidad de
            análisis y comunicación estructurada.
          </Text>

          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <Text>Alertas segmentadas por niveles de riesgo.</Text>
            </li>

            <li className="flex gap-2">
              <span>•</span>
              <Text>Comunicaciones institucionales reforzadas.</Text>
            </li>
          </ul>
        </div>

        {/* Platino */}
        <div className="rounded-xl border bg-purple-50 p-5 shadow-sm space-y-3">
          <Title size="sm" font="bold">
            💎 Plan Platino
          </Title>

          <Text>
            Máximo nivel de prevención colectiva, con herramientas avanzadas de
            control, participación y transparencia.
          </Text>

          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <Text>Alertas tempranas avanzadas y seguimiento continuo.</Text>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <Text>Reportes estratégicos de cartera y tendencias.</Text>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <Text>
                Integración con asambleas, votaciones y gestión documental.
              </Text>
            </li>
          </ul>
        </div>
      </div>

      {/* Cierre legal */}
      <div className="rounded-xl border bg-gray-100 p-5 shadow-sm space-y-2">
        <Text className="text-sm text-gray-700">
          La reducción de la morosidad se logra mediante información oportuna,
          estructura institucional y participación activa de la comunidad.
        </Text>

        <Text className="text-sm text-gray-700">
          COMPLEXESPHCLUB no actúa como entidad de cobro, no asume cartera ni
          garantiza pagos en ningún caso.
        </Text>
      </div>
    </section>
  );
}
