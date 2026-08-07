"use client";

import React from "react";
import Link from "next/link";
import { Title, Text, Badge } from "complexes-next-components";
import { FaLightbulb, FaVoteYea, FaFlask, FaBullhorn } from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";

/**
 * Participación en decisiones del ecosistema.
 *
 * El mecanismo formal de votación todavía no existe, así que la página separa
 * el canal que sí funciona hoy (proponer y priorizar a través del equipo) de
 * lo que está por construirse. Prometer un voto vinculante que no está
 * implementado sería la peor forma de estrenar esta sección.
 */
export default function Page() {
  const { language } = useLanguage();

  return (
    <section key={language} className="space-y-12">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 px-8 py-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white">Gobernanza del club</Badge>

          <Title size="md" font="bold">
            Participación en decisiones del ecosistema
          </Title>

          <Text className="text-cyan-100">
            La plataforma la usan los conjuntos todos los días; nosotros solo la
            construimos. Quien descubre qué falta es la administración que se
            topa con el problema a las siete de la mañana, no el equipo de
            producto.
          </Text>
        </div>
      </header>

      {/* CÓMO SE PARTICIPA HOY */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Title size="sm" font="bold">
            Cómo se participa hoy
          </Title>
          <Badge className="bg-green-100 text-green-800">Ya disponible</Badge>
        </div>

        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          No hace falta esperar a que exista una votación formal para que tu
          conjunto influya en lo que se construye.
        </Text>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Way
            icon={<FaLightbulb />}
            title="Propón lo que te falta"
            text="Cada solicitud de un conjunto entra al mismo tablero donde se decide qué se construye primero. Los pedidos que se repiten entre varias copropiedades suben solos."
          />
          <Way
            icon={<FaBullhorn />}
            title="Reporta lo que estorba"
            text="Un flujo que toma diez clics o un reporte que nadie usa es información tan valiosa como una función nueva. Se corrige con lo que nos cuentan."
          />
          <Way
            icon={<FaFlask />}
            title="Prueba antes que nadie"
            text="Los conjuntos que quieren participar reciben los módulos nuevos primero y su uso real define si la función se mantiene, se ajusta o se descarta."
          />
        </div>
      </div>

      {/* QUÉ SE DECIDE Y QUÉ NO */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <Title size="sm" font="bold">
            Sobre esto opinan los conjuntos
          </Title>

          <ul className="space-y-3">
            <Item text="Qué módulos se construyen primero y cuáles pueden esperar." />
            <Item text="Cómo debería comportarse un flujo que hoy incomoda en la operación diaria." />
            <Item text="Qué condiciones se buscan al negociar con proveedores de la red." />
            <Item text="Qué reglas mínimas debe cumplir una empresa para ser aliada." />
          </ul>
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-6 shadow-sm">
          <Title size="sm" font="bold">
            Esto no se decide en el club
          </Title>

          <ul className="space-y-3">
            <Limit text="Las decisiones internas de cada copropiedad: su reglamento y su asamblea son autónomos." />
            <Limit text="El presupuesto, la cartera o los contratos de otro conjunto." />
            <Limit text="Nada que exija ver información privada de otra copropiedad." />
          </ul>

          <Text size="sm" className="text-gray-500">
            El club coordina el ecosistema; no administra conjuntos ajenos.
          </Text>
        </div>
      </div>

      {/* HACIA DÓNDE VA */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Title size="sm" font="bold">
            Hacia dónde va la gobernanza
          </Title>
          <Badge className="bg-amber-100 text-amber-800">En construcción</Badge>
        </div>

        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Hoy la participación es conversada. Estas son las piezas que la van a
          volver formal, y todavía no están disponibles.
        </Text>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Roadmap
            icon={<FaVoteYea />}
            title="Votación de la hoja de ruta"
            text="Publicar las funciones candidatas de cada trimestre y que los conjuntos afiliados voten cuáles entran, con el peso del voto según el nivel de afiliación."
          />
          <Roadmap
            icon={<FaBullhorn />}
            title="Tablero público de solicitudes"
            text="Ver qué pidieron otros conjuntos, sumarse a una petición existente y seguir en qué estado va, sin tener que preguntar."
          />
          <Roadmap
            icon={<FaFlask />}
            title="Programa de conjuntos piloto"
            text="Un grupo estable de copropiedades que prueba cada módulo antes del lanzamiento general y firma el visto bueno."
          />
          <Roadmap
            icon={<FaLightbulb />}
            title="Comité del ecosistema"
            text="Representantes de conjuntos de distinto tamaño y ciudad revisando de forma periódica las reglas comunes de la red."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-700 to-blue-600 px-8 py-10 text-center text-white shadow-xl">
        <Title size="sm" font="bold">
          ¿Hay algo que tu conjunto necesita y no está?
        </Title>

        <Text className="mx-auto mt-3 max-w-2xl text-cyan-50">
          Cuéntanoslo. Buena parte de lo que hoy existe en la plataforma entró
          porque una administración lo pidió primero.
        </Text>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={route.contact}
            className="rounded-full bg-white px-7 py-2.5 text-sm font-bold text-cyan-800 transition-transform hover:scale-105"
          >
            Proponer una mejora
          </Link>
          <Link
            href={route.privat}
            className="rounded-full border-2 border-white/70 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Conocer la red privada
          </Link>
        </div>
      </div>
    </section>
  );
}

function Way({
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

function Item({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-cyan-600">✔</span>
      <Text size="sm" className="text-gray-700">
        {text}
      </Text>
    </li>
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
