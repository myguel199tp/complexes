"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
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
  DEMAND_CATEGORY_LABELS,
} from "./services/b2bDemandService";
import { StarRating } from "./_components/star-rating";
import { B2bNav } from "./_components/b2b-nav";
import { fileUrl } from "@/app/helpers/fileUrl";

function resolveLogo(logoUrl?: string): string | null {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return fileUrl(logoUrl);
}

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
      <Title size="sm" font="bold" className="text-white">
        Aliados B2B para tu conjunto
      </Title>
      <Text size="sm" className="text-slate-400 mt-1">
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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
        />
        <InputField
          regexType="letters"
          placeholder="Ciudad"
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
        <Text size="sm" className="text-slate-300">
          Solo proveedores verificados
        </Text>
        <Text size="xs" className="text-slate-500">
          (RUT, cámara, ARL y póliza al día)
        </Text>
      </label>

      {data ? (
        <Text size="sm" className="text-slate-500 mt-3">
          {data.total === 0
            ? "Ningún aliado coincide"
            : `${data.total} aliado${data.total === 1 ? "" : "s"}`}
          {data.totalPages > 1
            ? ` · página ${data.page} de ${data.totalPages}`
            : ""}
        </Text>
      ) : null}

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
      ) : comercios && comercios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {comercios.map((c: B2bComercio) => {
            const logo = resolveLogo(c.logoUrl);
            return (
              <Link
                key={c.id}
                // El servicio buscado viaja al detalle para que el catálogo
                // llegue ya filtrado por lo que la persona vino a resolver.
                href={
                  category ? `/my-b2b/${c.id}?category=${category}` : `/my-b2b/${c.id}`
                }
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.08] transition flex flex-col"
              >
                <div className="flex items-center justify-center h-24 bg-white/5 rounded-md overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt={c.businessName}
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-cyan-300">
                      {c.businessName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="mt-2 font-semibold text-slate-100 flex items-center gap-1.5">
                  {c.businessName}
                  {c.verified ? (
                    <span
                      title="Soportes obligatorios al día y revisados"
                      className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0"
                    >
                      ✓ verificado
                    </span>
                  ) : null}
                </span>
                <span className="mt-1">
                  <StarRating value={c.ratingAverage} count={c.ratingCount} />
                </span>
                {c.city ? (
                  <span className="text-slate-400 text-xs">
                    {c.city}
                    {c.country ? `, ${c.country}` : ""}
                  </span>
                ) : null}
                {c.description ? (
                  <span className="text-slate-500 text-xs mt-1 line-clamp-3">
                    {c.description}
                  </span>
                ) : null}
                {c.categories?.length ? (
                  <span className="flex flex-wrap gap-1 mt-2">
                    {c.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {DEMAND_CATEGORY_LABELS[cat] ?? cat}
                      </span>
                    ))}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
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
          <Text size="sm" className="text-slate-400">
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
