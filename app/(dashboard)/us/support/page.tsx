"use client";

import React from "react";
import Link from "next/link";
import { Title, Text, Badge } from "complexes-next-components";
import { FaHeadset, FaRobot, FaTools, FaExclamationTriangle } from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";

/**
 * Soporte del club. Los niveles reflejan `plans_features.*.soporte` de los
 * archivos de idioma: hoy Básico y Oro comparten soporte estándar y solo
 * Platino tiene prioridad. Los tiempos de respuesta se describen como
 * compromiso de servicio, no como cifras medidas.
 */
export default function Page() {
  const { language } = useLanguage();

  return (
    <section key={language} className="space-y-12">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 px-8 py-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white">Acompañamiento</Badge>

          <Title size="md" font="bold">
            Soporte y prioridad operativa
          </Title>

          <Text className="text-cyan-100">
            Un problema en la plataforma un día de asamblea no es lo mismo que
            una duda de configuración un martes cualquiera. El nivel de
            afiliación define qué tan rápido entra tu conjunto a la fila.
          </Text>
        </div>
      </header>

      {/* CANALES */}
      <div>
        <Title size="sm" font="bold">
          Por dónde te atendemos
        </Title>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Channel
            icon={<FaRobot />}
            title="Asistente con IA"
            text="Primera línea, disponible siempre. Resuelve dudas de uso y consultas de información del conjunto sin esperar a nadie."
          />
          <Channel
            icon={<FaHeadset />}
            title="Mesa de ayuda"
            text="Para lo que el asistente no resuelve: configuración, cargue de datos, permisos y casos particulares de la copropiedad."
          />
          <Channel
            icon={<FaTools />}
            title="Acompañamiento en implementación"
            text="Puesta en marcha del conjunto: migración de información, creación de usuarios y capacitación a la administración."
          />
        </div>
      </div>

      {/* NIVELES */}
      <div>
        <Title size="sm" font="bold">
          Prioridad según el nivel de afiliación
        </Title>
        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Todos los conjuntos tienen soporte. Lo que cambia con el nivel es la
          prioridad en la cola y el acompañamiento incluido.
        </Text>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Tier
            name="Básico"
            support="Soporte estándar de la plataforma"
            items={[
              "Asistente con IA sin límite de canal",
              "Mesa de ayuda por los canales de la plataforma",
              "Atención en orden de llegada",
            ]}
          />

          <Tier
            name="Oro"
            support="Soporte estándar de la plataforma"
            items={[
              "Todo lo del nivel Básico",
              "Acompañamiento en la puesta en marcha del conjunto",
              "Atención en orden de llegada",
            ]}
          />

          <Tier
            name="Platino"
            support="Soporte prioritario de la plataforma"
            items={[
              "Todo lo del nivel Oro",
              "Prioridad sobre el resto de la cola",
              "Acompañamiento en asambleas y cierres de mes",
            ]}
            highlight
          />
        </div>

        <div className="mt-4">
          <Link
            href={route.benefits}
            className="text-sm font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-600"
          >
            Comparar todo lo que incluye cada nivel →
          </Link>
        </div>
      </div>

      {/* URGENCIAS */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <FaExclamationTriangle />
            </span>
            <Title size="sm" font="bold">
              Qué se atiende primero
            </Title>
          </div>

          <Text className="text-gray-600">
            Sin importar el nivel, lo que deja al conjunto sin operar pasa al
            frente: portería que no puede validar accesos, asamblea en curso que
            no registra votos, o residentes que no pueden entrar a la
            plataforma.
          </Text>
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-6 shadow-sm">
          <Title size="sm" font="bold">
            Lo que el soporte no hace
          </Title>

          <ul className="space-y-3">
            <Limit text="No administra el conjunto ni toma decisiones por la administración." />
            <Limit text="No responde por acuerdos entre la copropiedad y sus proveedores." />
            <Limit text="No cobra cartera ni gestiona pagos de los residentes." />
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-700 to-blue-600 px-8 py-10 text-center text-white shadow-xl">
        <Title size="sm" font="bold">
          ¿Necesitas ayuda con tu conjunto?
        </Title>

        <Text className="mx-auto mt-3 max-w-2xl text-cyan-50">
          Escríbenos y te decimos exactamente qué incluye el soporte para tu
          nivel de afiliación.
        </Text>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={route.contact}
            className="rounded-full bg-white px-7 py-2.5 text-sm font-bold text-cyan-800 transition-transform hover:scale-105"
          >
            Contactar al equipo
          </Link>
          <Link
            href={route.demost}
            className="rounded-full border-2 border-white/70 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Solicitar una demostración
          </Link>
        </div>
      </div>
    </section>
  );
}

function Channel({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-lg text-cyan-700">
        {icon}
      </span>
      <Title as="h3" size="xs" font="semi" className="mt-4">
        {title}
      </Title>
      <Text size="sm" className="mt-2 text-gray-600">
        {text}
      </Text>
    </div>
  );
}

function Tier({
  name,
  support,
  items,
  highlight,
}: {
  name: string;
  support: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border p-6 shadow-sm ${
        highlight ? "border-cyan-600 bg-cyan-50/60" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <Title as="h3" size="xs" font="bold">
          {name}
        </Title>
        {highlight ? (
          <Badge className="bg-cyan-700 text-white">Prioritario</Badge>
        ) : null}
      </div>

      <Text size="sm" className="mt-2 font-semibold text-cyan-800">
        {support}
      </Text>

      <ul className="mt-4 flex-1 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-600">✔</span>
            <Text size="sm" className="text-gray-700">
              {i}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Limit({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 font-bold text-cyan-700">✕</span>
      <Text size="sm" className="text-gray-700">
        {text}
      </Text>
    </li>
  );
}
