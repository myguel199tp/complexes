"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InputField, Text, Title } from "complexes-next-components";
import {
  FaFileSignature,
  FaShieldAlt,
  FaStar,
  FaTags,
} from "react-icons/fa";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { useAliados } from "@/app/components/aliados/use-aliados";
import { AliadosGrid } from "@/app/components/aliados/aliados-grid";

/**
 * Directorio público de empresas aliadas (B2B): proveedores que le venden a la
 * copropiedad. Esta pantalla solo lista y filtra; explicar los modelos de
 * negocio y captar comercios es trabajo de /soluciones/comercios, así que aquí
 * únicamente se enlaza allá para no repetir la misma landing dos veces.
 */
export default function AliadosShowcase() {
  const { language } = useLanguage();
  const { aliados, isLoading, isError, reload } = useAliados();
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();

  const filtrados = useMemo(() => {
    if (!term) return aliados;
    return aliados.filter((a) =>
      [a.businessName, a.description, a.city, a.country].some((field) =>
        field?.toLowerCase().includes(term),
      ),
    );
  }, [aliados, term]);

  const hayAliados = !isLoading && !isError && aliados.length > 0;

  return (
    <div key={language} className="mx-auto max-w-7xl space-y-12 px-4 pb-16">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-3xl p-8 shadow-xl md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Directorio B2B
            </span>
            {hayAliados ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cyan-800">
                {aliados.length} aliados activos
              </span>
            ) : null}
          </div>

          <Title size="sm" font="bold" className="mt-4 max-w-3xl text-white">
            Empresas aliadas para tu conjunto
          </Title>

          <Text className="mt-3 max-w-3xl text-cyan-50">
            Proveedores registrados que le prestan servicios directamente a la
            copropiedad: mantenimiento, aseo, seguridad, obras y más. Publican
            sus planes con precio y la administración contrata desde la
            plataforma.
          </Text>
        </div>
      </header>

      {/* QUÉ GARANTIZA EL DIRECTORIO */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Benefit
          icon={<FaShieldAlt />}
          title="Proveedores verificados"
          description="Empresas registradas con sus datos de contacto, ubicación y documentación al día."
        />
        <Benefit
          icon={<FaTags />}
          title="Planes con precio claro"
          description="Cada aliado publica sus planes con valor y periodicidad; sin cotizaciones a ciegas."
        />
        <Benefit
          icon={<FaFileSignature />}
          title="Contratos en la plataforma"
          description="La alianza se solicita, se aprueba y queda registrada con su historial."
        />
        <Benefit
          icon={<FaStar />}
          title="Calificaciones reales"
          description="Los conjuntos califican el servicio recibido; la siguiente administración decide con datos."
        />
      </section>

      {/* DIRECTORIO */}
      <section id="directorio-b2b" className="scroll-mt-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Title size="xs" font="bold">
              Directorio de aliados
            </Title>
            <Text size="sm" className="mt-1 text-gray-500">
              Busca por nombre, actividad o ciudad.
            </Text>
          </div>

          {hayAliados ? (
            <div className="w-full md:max-w-sm">
              <InputField
                regexType="safeChars"
                placeholder="Buscar aliado"
                rounded="lg"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <AliadosGrid
            aliados={filtrados}
            isLoading={isLoading}
            isError={isError}
            onRetry={reload}
            searchTerm={term ? search.trim() : undefined}
            onClearSearch={() => setSearch("")}
          />
        </div>
      </section>

      {/* PIE: PARA COMERCIOS */}
      <section className="rounded-3xl bg-gradient-to-br from-gray-50 to-cyan-50/60 p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Title size="xs" font="bold">
              ¿Tu negocio quiere aparecer aquí?
            </Title>
            <Text size="sm" className="mt-2 text-gray-600">
              Publica tus planes de servicio para las copropiedades o tu
              catálogo para los residentes. El registro es gratis y sin comisión
              por venta.
            </Text>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <Link
              href={route.comercios}
              className="rounded-full bg-cyan-700 px-6 py-2.5 text-center text-sm font-bold text-white transition-transform hover:scale-105"
            >
              Ver cómo funciona
            </Link>
            <Link
              href="/comercio/login"
              className="rounded-full border-2 border-cyan-700 px-6 py-2.5 text-center text-sm font-bold text-cyan-800 transition-colors hover:bg-cyan-50"
            >
              Ya estoy registrado
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-lg text-cyan-700">
        {icon}
      </div>
      <Text font="bold" size="sm" className="mt-3">
        {title}
      </Text>
      <Text size="sm" className="mt-1 text-gray-600">
        {description}
      </Text>
    </div>
  );
}
