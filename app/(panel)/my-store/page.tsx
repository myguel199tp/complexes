"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { route } from "@/app/_domain/constants/routes";
import { getActiveBranches } from "./services/comercioStoreService";

export default function MyStorePage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const branchesQuery = useQuery({
    queryKey: ["store-branches", conjuntoId],
    queryFn: () => getActiveBranches(conjuntoId),
    enabled: !!conjuntoId,
  });

  const branches = branchesQuery.data ?? [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title size="sm" font="bold" colVariant="on">
          Tienda
        </Title>
        <Link href={route.myStoreOrders}>
          <Button size="sm" rounded="md">
            Mis pedidos
          </Button>
        </Link>
      </div>

      {branchesQuery.isLoading ? (
        <p className="text-gray-500">Cargando comercios...</p>
      ) : branches.length === 0 ? (
        <p className="text-gray-500">
          Aún no hay comercios disponibles en tu conjunto.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              href={`${route.storeComercio}/${branch.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-5 shadow hover:shadow-md transition"
            >
              <span className="font-bold text-gray-800">
                {branch.comercio.businessName}
              </span>
              <span className="text-sm text-gray-500">
                {branch.name} · {branch.address}
              </span>
              <span className="text-sm text-gray-500">
                Atendido por {branch.comercio.ownerName}
              </span>
              <span className="text-sm text-gray-500">
                {branch.comercio.phone}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
