"use client";

import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import { FaHandshake, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { AliadoB2b } from "./aliados-service";
import { AliadoCard, AliadoCardSkeleton } from "./aliado-card";

interface Props {
  aliados: AliadoB2b[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Texto de búsqueda activo; cambia el mensaje cuando no hay coincidencias. */
  searchTerm?: string;
  onClearSearch?: () => void;
  /** Número de esqueletos mientras carga. */
  skeletonCount?: number;
}

/**
 * Grilla de aliados con estados explícitos: cargando, error, sin resultados de
 * búsqueda y vitrina todavía vacía. Nunca devuelve `null`, para que la página
 * no quede en blanco.
 */
export function AliadosGrid({
  aliados,
  isLoading,
  isError,
  onRetry,
  searchTerm,
  onClearSearch,
  skeletonCount = 8,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AliadoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <StateBox
        icon={<FaExclamationTriangle className="text-3xl text-amber-500" />}
        title="No pudimos cargar los aliados"
        description="Hubo un problema de conexión con el servicio. Puedes intentarlo de nuevo en un momento."
      >
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-cyan-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
        >
          Reintentar
        </button>
      </StateBox>
    );
  }

  if (aliados.length === 0 && searchTerm) {
    return (
      <StateBox
        icon={<FaSearch className="text-3xl text-cyan-700" />}
        title={`Sin resultados para "${searchTerm}"`}
        description="Prueba con otro nombre, categoría o ciudad. También puedes ver todos los aliados disponibles."
      >
        {onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-full border-2 border-cyan-700 px-6 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-50"
          >
            Ver todos los aliados
          </button>
        ) : null}
      </StateBox>
    );
  }

  if (aliados.length === 0) {
    return (
      <StateBox
        icon={<FaHandshake className="text-4xl text-cyan-700" />}
        title="Estamos construyendo la red de aliados"
        description="Aquí aparecerán las empresas que prestan servicios directamente a los conjuntos: mantenimiento, aseo, seguridad, jardinería, obras, tecnología y más. Cada aliado publica sus planes y tu administración puede contratarlos desde la plataforma."
      >
        <Link
          href="/comercio/register"
          className="rounded-full bg-cyan-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
        >
          Registrar mi empresa como aliada
        </Link>
        <Link
          href="/us/alianz"
          className="rounded-full border-2 border-cyan-700 px-6 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-50"
        >
          Conocer el programa
        </Link>
      </StateBox>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {aliados.map((aliado) => (
        <AliadoCard key={aliado.id} aliado={aliado} />
      ))}
    </div>
  );
}

function StateBox({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50/60 to-blue-50/60 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        {icon}
      </div>

      <Title size="xs" font="bold" className="mt-5">
        {title}
      </Title>

      <Text size="sm" className="mt-3 max-w-xl text-gray-600">
        {description}
      </Text>

      {children ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">{children}</div>
      ) : null}
    </div>
  );
}
