"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  InputField,
  SelectField,
  Title,
  Text,
} from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  B2bComercio,
  B2bComercioSort,
  getB2bComercios,
} from "./services/b2bAllianceService";
import {
  B2B_DEMAND_CATEGORIES,
  B2bDemandCategory,
} from "./services/b2bDemandService";
import { B2bNav } from "./_components/b2b-nav";
import { AllyCard } from "./_components/ally-card";

const SORT_OPTIONS: { value: B2bComercioSort; label: string }[] = [
  { value: "rating", label: "Mejor calificados" },
  { value: "name", label: "Nombre (A-Z)" },
  { value: "recent", label: "Más recientes" },
];

export default function MyB2bPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<B2bComercioSort>("rating");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [page, setPage] = useState(1);

  // El texto se manda al servidor con retraso: buscar en cada tecla dispara una
  // consulta por letra y la que llega tarde pisa a la que el usuario ya vio.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Cambiar un filtro reinicia la paginación: quedarse en la página 4 de un
  // resultado que ahora tiene una sola página muestra un vacío que parece un
  // error.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, city, category, sort, onlyVerified]);

  const filters = {
    search: debouncedSearch || undefined,
    city: city.trim() || undefined,
    category: (category as B2bDemandCategory) || undefined,
    onlyVerified,
    sort,
    page,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["my_b2b_comercios", conjuntoId, filters],
    queryFn: () => getB2bComercios(conjuntoId, filters),
    enabled: !!conjuntoId,
    // Mantiene la página anterior mientras llega la nueva, para que la grilla
    // no parpadee a "Cargando..." en cada tecla.
    keepPreviousData: true,
  });

  const comercios = data?.items;
  const hasFilters = !!(debouncedSearch || city.trim() || category);

  return (
    <div className="w-full p-2">
      <Title size="sm" font="bold" className="text-slate-900 dark:text-white">
        Aliados B2B para tu conjunto
      </Title>
      <Text size="sm" className="mt-1 text-slate-600 dark:text-slate-400">
        Empresas que ofrecen servicios directamente al conjunto. Elige una para
        ver sus planes y solicitar una alianza.
      </Text>

      <B2bNav />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <InputField
          regexType="safeChars"
          placeholder="Buscar por nombre"
          rounded="md"
          inputSize="sm"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
        <SelectField
          options={B2B_DEMAND_CATEGORIES.map((c) => ({
            label: c.label,
            value: c.value,
          }))}
          defaultOption="Todos los servicios"
          helpText="Todos los servicios "
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
        />
        <InputField
          regexType="letters"
          placeholder="Ciudad"
          helpText="Ciudad"
          rounded="md"
          inputSize="sm"
          value={city}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCity(e.target.value)
          }
        />
        <SelectField
          options={SORT_OPTIONS}
          value={sort}
          onChange={(e) => setSort(e.target.value as B2bComercioSort)}
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
        />
      </div>

      {/* El conjunto responde solidariamente por su proveedor, así que este
          filtro no es una preferencia: es lo que evita meter al edificio a una
          empresa cuya ARL nadie miró. */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={onlyVerified}
          onChange={(e) => setOnlyVerified(e.target.checked)}
          className="accent-emerald-500"
        />
        <Text size="sm" className="text-slate-700 dark:text-slate-300">
          Solo proveedores verificados
        </Text>
        <Text size="xs" className="text-slate-500 dark:text-slate-400">
          (RUT, cámara, ARL y póliza al día)
        </Text>
      </label>

      {data ? (
        <Text size="sm" className="mt-3 text-slate-600 dark:text-slate-400">
          {data.total === 0
            ? "Ningún aliado coincide"
            : `${data.total} aliado${data.total === 1 ? "" : "s"}`}
          {data.totalPages > 1
            ? ` · página ${data.page} de ${data.totalPages}`
            : ""}
        </Text>
      ) : null}

      {isLoading ? (
        <Text size="sm" className="mt-6 text-slate-600 dark:text-slate-400">
          Cargando...
        </Text>
      ) : comercios && comercios.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comercios.map((c: B2bComercio) => (
            <AllyCard key={c.id} comercio={c} category={category} />
          ))}
        </div>
      ) : (
        <Text size="sm" className="mt-6 text-slate-600 dark:text-slate-400">
          {hasFilters
            ? "Ningún aliado coincide con la búsqueda. Prueba con otro servicio o quita la ciudad."
            : "Aún no hay comercios B2B disponibles."}
        </Text>
      )}

      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            size="xs"
            rounded="md"
            colVariant="default"
            disabled={data.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Text size="sm" className="text-slate-600 dark:text-slate-400">
            {data.page} / {data.totalPages}
          </Text>
          <Button
            size="xs"
            rounded="md"
            colVariant="default"
            disabled={data.page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
