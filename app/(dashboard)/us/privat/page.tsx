"use client";

import React from "react";
import Link from "next/link";
import { Title, Text, Badge } from "complexes-next-components";
import {
  FaStar,
  FaHandshake,
  FaPlaneDeparture,
  FaLock,
  FaComments,
  FaChartBar,
  FaBoxes,
  FaMedal,
} from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";

/**
 * Página del club: la red privada de conjuntos.
 *
 * Se separa a propósito lo que la red ya hace (reputación de proveedores,
 * demanda agregada y movilidad entre conjuntos) de lo que está en construcción,
 * porque prometer un foro entre administraciones que hoy no existe destruiría
 * la confianza que esta misma página busca construir.
 */
export default function Page() {
  const { language } = useLanguage();

  return (
    <section className="space-y-12">
      <header
        key={language}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 px-8 py-10 text-white shadow-xl"
      >
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white">Red privada</Badge>

          <Title size="md" font="bold">
            Red privada de conjuntos residenciales
          </Title>

          <Text className="text-cyan-100">
            Cada conjunto aprende por las malas: el proveedor que incumplió, el
            precio que estaba inflado, el contrato que no había que firmar. Ese
            aprendizaje hoy se pierde en la portería. La red existe para que no
            se pierda.
          </Text>
        </div>
      </header>

      {/* LO QUE LA RED YA HACE */}
      <div>
        <Title size="sm" font="bold">
          Lo que la red comparte hoy
        </Title>
        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          No es una promesa a futuro: son tres cosas que ya circulan entre las
          copropiedades afiliadas.
        </Text>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<FaStar />}
            title="Reputación de proveedores"
            text="Cuando un conjunto califica a una empresa aliada, esa nota queda visible para todas las demás. La siguiente administración que la contrate ya sabe cómo le fue a las anteriores."
            linkLabel="Ver el directorio de aliados"
            href={route.advertisement}
          />

          <Feature
            icon={<FaHandshake />}
            title="Peso para negociar"
            text="Un proveedor que quiere entrar no negocia con un edificio: negocia con una red de copropiedades. Publica sus planes con precio abierto y compite por todas a la vez."
            linkLabel="Cómo funcionan las alianzas"
            href={route.alianz}
          />

          <Feature
            icon={<FaPlaneDeparture />}
            title="Movilidad entre conjuntos"
            text="Los residentes pueden alquilar o intercambiar vivienda vacacional con residentes de otros conjuntos de la red, entre pares verificados y no entre desconocidos."
            linkLabel="Ver alquiler vacacional"
            href={route.reserva}
          />
        </div>
      </div>

      {/* LÍMITES: QUÉ NO SE COMPARTE */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <FaLock />
            </span>
            <Title size="sm" font="bold">
              Privada quiere decir privada
            </Title>
          </div>

          <Text className="text-gray-600">
            Pertenecer a la red no abre las puertas de tu conjunto a los demás.
            Lo que se comparte es reputación de proveedores y oportunidades, no
            la información de la copropiedad.
          </Text>
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-6 shadow-sm">
          <Title size="sm" font="bold">
            La red nunca comparte
          </Title>

          <ul className="space-y-3">
            <Limit text="Datos personales de residentes ni de propietarios." />
            <Limit text="Estados de cuenta, cartera ni información financiera del conjunto." />
            <Limit text="Actas, documentos internos ni decisiones de la asamblea." />
          </ul>

          <Text size="sm" className="text-gray-500">
            Cada copropiedad opera de forma independiente y decide qué publica.
          </Text>
        </div>
      </div>

      {/* HACIA DÓNDE VA */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Title size="sm" font="bold">
            Hacia dónde va la red
          </Title>
          <Badge className="bg-amber-100 text-amber-800">En construcción</Badge>
        </div>

        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Estas capacidades están en desarrollo y se habilitan por etapas según
          el nivel de afiliación del conjunto.
        </Text>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Roadmap
            icon={<FaComments />}
            title="Conversación entre administraciones"
            text="Un espacio donde los consejos y administradores de distintos conjuntos consultan casos reales: proveedores, contratos, obras y decisiones difíciles. Hoy el foro existe, pero es interno de cada conjunto."
          />
          <Roadmap
            icon={<FaChartBar />}
            title="Comparativos operativos"
            text="Ver cómo está tu conjunto frente a otros de tamaño similar en costos, morosidad y tiempos de respuesta, siempre de forma agregada y sin identificar a nadie."
          />
          <Roadmap
            icon={<FaBoxes />}
            title="Compras por volumen"
            text="Juntar la demanda de varios conjuntos para negociar un solo precio en insumos y servicios recurrentes."
          />
          <Roadmap
            icon={<FaMedal />}
            title="Niveles de afiliación"
            text="Prioridad de soporte, acceso anticipado a convenios y voz en las decisiones del ecosistema según la antigüedad y el nivel del conjunto."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-blue-600 px-8 py-10 text-center text-white shadow-xl">
        <Title size="sm" font="bold">
          Tu conjunto no tiene por qué aprender solo
        </Title>

        <Text className="mx-auto mt-3 max-w-2xl text-cyan-50">
          La red se vuelve más útil con cada copropiedad que entra: más
          proveedores calificados, mejores condiciones y menos decisiones a
          ciegas.
        </Text>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={route.registerComplex}
            className="rounded-full bg-white px-7 py-2.5 text-sm font-bold text-cyan-800 transition-transform hover:scale-105"
          >
            Afiliar mi conjunto
          </Link>
          <Link
            href={route.us}
            className="rounded-full border-2 border-white/70 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver todos los beneficios del club
          </Link>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  text,
  linkLabel,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-lg text-cyan-700">
        {icon}
      </span>

      <Title as="h3" size="xs" font="semi" className="mt-4">
        {title}
      </Title>

      <Text size="sm" className="mt-2 flex-1 text-gray-600">
        {text}
      </Text>

      <Link
        href={href}
        className="mt-4 text-sm font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-600"
      >
        {linkLabel} →
      </Link>
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

function Roadmap({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-dashed border-cyan-200 bg-white/70 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
        {icon}
      </span>
      <div>
        <Text font="bold" size="sm">
          {title}
        </Text>
        <Text size="sm" className="mt-1 text-gray-600">
          {text}
        </Text>
      </div>
    </div>
  );
}
