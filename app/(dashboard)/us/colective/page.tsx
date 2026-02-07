"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text, Badge } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";
import { FaShieldAlt, FaBell, FaChartLine } from "react-icons/fa";

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
    <section className="space-y-12">
      {/* HERO */}
      <header
        key={language}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 px-8 py-10 shadow-xl text-white"
      >
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white">
            Ecosistema preventivo
          </Badge>

          <Title size="md" font="bold">
            Protección colectiva frente a la morosidad
          </Title>

          <Text className="text-cyan-100">
            Un enfoque institucional y comunitario para reducir la morosidad sin
            cobros, sin confrontaciones y sin procesos legales.
          </Text>

          <Button
            colVariant="warning"
            className="mt-4 flex items-center gap-2 w-fit"
            onClick={handleRegister}
            disabled={isPending}
          >
            {t("inscripcion")}
            {isPending && <ImSpinner9 className="animate-spin" />}
          </Button>
        </div>
      </header>

      {/* INTRO */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-3">
          <Text>
            COMPLEXESPHCLUB no realiza cobros de cartera ni garantiza pagos. Su
            rol es preventivo, estructural y comunitario.
          </Text>

          <Text className="text-gray-600">
            El club crea reglas comunes, alertas tempranas y presión
            institucional legítima para reducir la morosidad de forma
            sostenible.
          </Text>
        </div>

        <div className="rounded-xl bg-gray-50 p-6 shadow-sm space-y-4">
          <Title size="sm" font="bold">
            Enfoque del ecosistema
          </Title>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <FaBell className="text-cyan-700 mt-1" />
              <Text>Alertas tempranas sobre niveles de morosidad.</Text>
            </div>

            <div className="flex gap-3 items-start">
              <FaChartLine className="text-cyan-700 mt-1" />
              <Text>Reportes comparativos y análisis preventivo.</Text>
            </div>

            <div className="flex gap-3 items-start">
              <FaShieldAlt className="text-cyan-700 mt-1" />
              <Text>
                Presión institucional basada en transparencia y participación.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* PLANES */}
      <div className="space-y-4">
        <Title size="md" font="bold">
          Planes del club
        </Title>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Básico */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <Title size="sm" font="bold">
              🩵 Básico
            </Title>

            <Text className="text-gray-600">
              Visibilidad y comunicación esencial para iniciar un control
              preventivo.
            </Text>

            <ul className="space-y-2 text-sm">
              <li>• Alertas generales de morosidad</li>
              <li>• Reportes básicos</li>
              <li>• Comunicados estándar</li>
            </ul>
          </div>

          {/* Oro */}
          <div className="rounded-2xl border bg-yellow-50 p-6 shadow-sm space-y-4">
            <Title size="sm" font="bold">
              🟡 Oro
            </Title>

            <Text className="text-gray-700">
              Mayor capacidad de análisis y comunicación institucional.
            </Text>

            <ul className="space-y-2 text-sm">
              <li>• Alertas segmentadas por riesgo</li>
              <li>• Comunicaciones reforzadas</li>
              <li>• Comparativos históricos</li>
            </ul>
          </div>

          {/* Platino */}
          <div className="relative rounded-2xl border-2 border-purple-500 bg-purple-50 p-6 shadow-lg space-y-4">
            <Badge className="absolute -top-3 right-4 bg-purple-600 text-white">
              Recomendado
            </Badge>

            <Title size="sm" font="bold">
              💎 Platino
            </Title>

            <Text className="text-gray-700">
              Máximo nivel de prevención colectiva y control estratégico.
            </Text>

            <ul className="space-y-2 text-sm">
              <li>• Alertas avanzadas y seguimiento continuo</li>
              <li>• Reportes estratégicos y tendencias</li>
              <li>• Integración con asambleas y documentos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CIERRE */}
      <div className="rounded-xl border bg-gray-100 p-6 space-y-2">
        <Text className="text-sm text-gray-700">
          La reducción de la morosidad se logra mediante información oportuna,
          estructura institucional y participación comunitaria.
        </Text>

        <Text className="text-sm text-gray-700">
          COMPLEXESPHCLUB no actúa como entidad de cobro ni asume cartera en
          ningún caso.
        </Text>
      </div>
    </section>
  );
}
