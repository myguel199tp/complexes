"use client";

import React from "react";
import Link from "next/link";
import { Title, Text, Badge } from "complexes-next-components";
import { FaBoxes, FaHandshake, FaStore, FaUsers } from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";

/**
 * Marketplace del club: compras agregadas entre conjuntos.
 *
 * Es la tercera superficie comercial del ecosistema y la más fácil de
 * confundir, así que la página incluye una comparación explícita con la tienda
 * del conjunto (B2C) y el directorio de aliados (B2B). La negociación por
 * volumen todavía se hace acompañada, no de forma automática, y así se dice.
 */
export default function Page() {
  const { language } = useLanguage();

  return (
    <section key={language} className="space-y-12">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 px-8 py-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white">Compra agregada</Badge>

          <Title size="md" font="bold">
            Marketplace del club
          </Title>

          <Text className="text-cyan-100">
            Un conjunto solo compra como un conjunto solo. Cien conjuntos
            comprando lo mismo negocian otro precio. El marketplace del club
            junta esa demanda para que la copropiedad pague lo que paga un
            comprador grande.
          </Text>
        </div>
      </header>

      {/* QUÉ SE COMPRA ASÍ */}
      <div>
        <Title size="sm" font="bold">
          Qué tiene sentido comprar en conjunto
        </Title>
        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Lo que todas las copropiedades consumen igual, mes a mes, y donde el
          volumen sí mueve el precio.
        </Text>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🧴",
              title: "Insumos de aseo",
              text: "Productos de limpieza, bolsas y dotación para el personal.",
            },
            {
              icon: "💡",
              title: "Iluminación y eléctricos",
              text: "Luminarias, sensores y repuestos de uso recurrente.",
            },
            {
              icon: "🛗",
              title: "Mantenimiento técnico",
              text: "Contratos de ascensores, bombas, motobombas y equipos de presión.",
            },
            {
              icon: "🛡️",
              title: "Pólizas y seguros",
              text: "Seguro de áreas comunes y responsabilidad civil negociados en bloque.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="text-3xl">{c.icon}</div>
              <Text font="bold" size="sm" className="mt-3">
                {c.title}
              </Text>
              <Text size="sm" className="mt-1 text-gray-600">
                {c.text}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* DIFERENCIA CON LAS OTRAS DOS SUPERFICIES */}
      <div>
        <Title size="sm" font="bold">
          En qué se diferencia de lo demás
        </Title>
        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          El ecosistema tiene tres lugares donde se compra y se vende. No son lo
          mismo y conviene no confundirlos.
        </Text>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Surface
            icon={<FaStore />}
            title="Tienda del conjunto"
            who="Compra el residente"
            text="Negocios de la ciudad que le venden a las familias y entregan en la portería. Precio de mostrador."
            href={`${route.advertisement}#tiendas-b2c`}
            linkLabel="Ver cómo funciona"
          />

          <Surface
            icon={<FaHandshake />}
            title="Empresas aliadas"
            who="Compra la administración"
            text="Proveedores que le prestan servicios a la copropiedad con planes publicados y contrato individual."
            href={route.advertisement}
            linkLabel="Ver el directorio"
          />

          <Surface
            icon={<FaBoxes />}
            title="Marketplace del club"
            who="Compran varios conjuntos juntos"
            text="La misma necesidad de muchas copropiedades se agrupa en una sola negociación de precio."
            highlight
          />
        </div>
      </div>

      {/* CÓMO FUNCIONA HOY */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Title size="sm" font="bold">
            Cómo funciona hoy
          </Title>
          <Badge className="bg-amber-100 text-amber-800">
            Negociación acompañada
          </Badge>
        </div>

        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Todavía no es un catálogo automático: las primeras negociaciones se
          arman con el equipo del club, conjunto por conjunto. Preferimos
          decirlo a que llegues esperando un carrito de compras.
        </Text>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Step
            n="1"
            title="Se detecta la necesidad común"
            text="Varios conjuntos de la red coinciden en el mismo insumo o servicio."
          />
          <Step
            n="2"
            title="Se agrupa la demanda"
            text="El club consolida el volumen y define condiciones mínimas de calidad."
          />
          <Step
            n="3"
            title="Se negocia con proveedores"
            text="Los proveedores compiten por atender a toda la red, no a un edificio."
          />
          <Step
            n="4"
            title="Cada conjunto decide"
            text="La condición queda disponible y cada copropiedad la toma o no. Nadie queda obligado."
          />
        </div>
      </div>

      {/* ACCESO POR NIVEL */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <FaUsers />
            </span>
            <Title size="sm" font="bold">
              Quién puede participar
            </Title>
          </div>

          <Text className="text-gray-600">
            El acceso al marketplace del club está incluido en el nivel Platino.
            Los demás niveles pueden seguir contratando de forma individual a
            través del directorio de empresas aliadas.
          </Text>

          <Link
            href={route.benefits}
            className="inline-block text-sm font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-600"
          >
            Ver los niveles de afiliación →
          </Link>
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-6 shadow-sm">
          <Title size="sm" font="bold">
            Reglas del club
          </Title>

          <ul className="space-y-3">
            <Rule text="Ningún conjunto está obligado a comprar lo que se negocie." />
            <Rule text="El club no intermedia el pago: cada copropiedad contrata directo con el proveedor." />
            <Rule text="Las condiciones negociadas son visibles para todos los conjuntos con acceso." />
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-700 to-blue-600 px-8 py-10 text-center text-white shadow-xl">
        <Title size="sm" font="bold">
          ¿Tu conjunto está pagando precio de uno?
        </Title>

        <Text className="mx-auto mt-3 max-w-2xl text-cyan-50">
          Entre más copropiedades entran a la red, mejores son las condiciones
          que se pueden negociar para todas.
        </Text>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={route.registerComplex}
            className="rounded-full bg-white px-7 py-2.5 text-sm font-bold text-cyan-800 transition-transform hover:scale-105"
          >
            Afiliar mi conjunto
          </Link>
          <Link
            href={route.advertisement}
            className="rounded-full border-2 border-white/70 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Ver empresas aliadas
          </Link>
        </div>
      </div>
    </section>
  );
}

function Surface({
  icon,
  title,
  who,
  text,
  href,
  linkLabel,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  who: string;
  text: string;
  href?: string;
  linkLabel?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border p-6 shadow-sm ${
        highlight ? "border-cyan-600 bg-cyan-50/60" : "bg-white"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-lg text-cyan-700">
        {icon}
      </span>

      <Title as="h3" size="xs" font="semi" className="mt-4">
        {title}
      </Title>

      <span className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-700">
        {who}
      </span>

      <Text size="sm" className="mt-2 flex-1 text-gray-600">
        {text}
      </Text>

      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-4 text-sm font-semibold text-cyan-800 underline underline-offset-4 hover:text-cyan-600"
        >
          {linkLabel} →
        </Link>
      ) : (
        <span className="mt-4 text-sm font-semibold text-cyan-700">
          Estás aquí
        </span>
      )}
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-700 font-bold text-white">
        {n}
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

function Rule({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 font-bold text-cyan-700">•</span>
      <Text size="sm" className="text-gray-700">
        {text}
      </Text>
    </li>
  );
}
