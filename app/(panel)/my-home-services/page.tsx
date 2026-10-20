"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getHomeTrades } from "./services/homeServicesService";
import { MyRequests } from "./_components/my-requests";
import { ProviderDirectory } from "./_components/provider-directory";

/**
 * Servicios para tu hogar: negocios que cotizan obras en el apartamento
 * (pisos, cocinas, carpintería…). Es aparte de "Comercio": aquí no se compra
 * con precio fijo, se pide cotización y se contrata la obra.
 */
export default function MyHomeServicesPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [tab, setTab] = useState<"search" | "requests">("search");
  const [focus, setFocus] = useState<string | null>(null);

  const tradesQuery = useQuery({
    queryKey: ["home-trades", conjuntoId],
    queryFn: () => getHomeTrades(conjuntoId),
    enabled: !!conjuntoId,
    staleTime: Infinity,
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <Title size="sm" font="bold" colVariant="on">
          Servicios para tu hogar
        </Title>
        <Text size="sm" className="mt-1 text-gray-400">
          Pide cotización a negocios de pisos, cocinas, carpintería y más que trabajan en tu ciudad.
          Compara hasta tres y contrata desde aquí: la entrada de quien va a medir o a trabajar la
          autoriza la app en portería.
        </Text>
      </div>

      <div className="mb-5 flex gap-2">
        {(
          [
            ["search", "Buscar"],
            ["requests", "Mis solicitudes"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === value
                ? "bg-cyan-600 text-white dark:bg-cyan-500"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "search" ? (
        <ProviderDirectory
          conjuntoId={conjuntoId}
          trades={tradesQuery.data ?? []}
          onRequested={(request) => {
            setFocus(request.id);
            setTab("requests");
          }}
        />
      ) : (
        <MyRequests conjuntoId={conjuntoId} focusId={focus} />
      )}
    </div>
  );
}
