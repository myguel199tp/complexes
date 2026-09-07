"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button, InputField, Title, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { route } from "@/app/_domain/constants/routes";
import { getActiveBranches } from "./services/comercioStoreService";
import StoreCard from "./_components/store-card";

/**
 * Marcador de posición mientras carga.
 *
 * "Cargando comercios..." dejaba la pantalla en blanco y luego saltaban las
 * tarjetas de golpe; el esqueleto muestra desde el principio que lo que viene
 * es una vitrina.
 */
function StoreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
      <div className="h-32 animate-pulse bg-gray-200" />
      <div className="space-y-2 px-4 pb-4 pt-8">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function MyStorePage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [search, setSearch] = useState("");

  const branchesQuery = useQuery({
    queryKey: ["store-branches", conjuntoId],
    queryFn: () => getActiveBranches(conjuntoId),
    enabled: !!conjuntoId,
  });

  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return branches;

    return branches.filter((branch) =>
      [
        branch.comercio.businessName,
        branch.name,
        branch.address,
        branch.neighborhood ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [branches, search]);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title size="sm" font="bold" colVariant="on">
            Tienda
          </Title>

          {/* Antes solo estaba el título: nadie sabía por qué aparecían esas
              tiendas y no otras, ni que se podía pedir desde aquí. */}
          <Text size="sm" className="mt-1 text-gray-400">
            {branches.length > 0
              ? `${branches.length} comercio${
                  branches.length > 1 ? "s" : ""
                } atendiendo a tu conjunto. Pide sin salir de casa.`
              : "Los comercios que atienden a tu conjunto aparecen aquí."}
          </Text>
        </div>

        <Link href={route.myStoreOrders}>
          <Button size="sm" rounded="md">
            Mis pedidos
          </Button>
        </Link>
      </div>

      {/* El buscador solo estorba con dos tiendas; aparece cuando la vitrina
          empieza a ser larga de recorrer. */}
      {branches.length > 3 && (
        <div className="mb-5 max-w-sm">
          <InputField
            inputSize="sm"
            rounded="md"
            type="text"
            placeholder="Buscar tienda o dirección"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {branchesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StoreCardSkeleton />
          <StoreCardSkeleton />
          <StoreCardSkeleton />
        </div>
      ) : branches.length === 0 ? (
        // La lista ya no depende de la ciudad sino de qué comercios contrataron
        // a este conjunto, así que el vacío tiene una causa concreta y decirla
        // evita que se lea como un error de la aplicación.
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
          <div className="mb-3 text-4xl">🏪</div>

          <Text font="semi" className="text-gray-200">
            Todavía ningún comercio atiende a tu conjunto
          </Text>

          <Text size="sm" className="mx-auto mt-2 max-w-md text-gray-400">
            Los comercios se suscriben a los conjuntos que quieren atender.
            Cuando alguno se suscriba al tuyo, su tienda aparecerá aquí y podrás
            pedirle sin salir de casa.
          </Text>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
          <Text size="sm" className="text-gray-300">
            Ninguna tienda coincide con “{search}”.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((branch) => (
            <StoreCard key={branch.id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}
