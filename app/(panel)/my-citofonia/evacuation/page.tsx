"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Text, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  EvacuationResponse,
  evacuationService,
} from "../services/evacuationService";

/** En emergencia la lista tiene que estar fresca sin que nadie recargue. */
const REFRESH_MS = 15_000;

const ORIGIN_LABEL: Record<string, string> = {
  GATE: "Portería",
  ACCESS_PASS: "Pase de residente",
  GUEST_ACCESS: "Huésped",
  DELIVERY_RUN: "Domicilio",
  ASSISTANT: "Asistente",
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function EvacuationPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const { data, isLoading, error } = useQuery<EvacuationResponse>({
    queryKey: ["evacuation", conjuntoId],
    queryFn: () => evacuationService(conjuntoId!),
    enabled: !!conjuntoId,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Text size="sm">Cargando lista de evacuación…</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Text size="sm" className="text-red-600">
          {(error as Error).message}
        </Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title size="md" font="bold" as="h3" colVariant="on">
        Lista de evacuación
      </Title>

      <Text size="xs" className="text-gray-500 mb-4">
        Personas dentro del conjunto que no residen en él. Se actualiza sola cada{" "}
        {REFRESH_MS / 1000} segundos.
      </Text>

      <div className="flex gap-3 mb-4">
        <Badge background="primary" size="sm" rounded="lg" role="contentinfo">
          Visitantes dentro:{" "}
          <Text as="span" size="sm" font="bold">
            {data?.totalVisitorsInside ?? 0}
          </Text>
        </Badge>

        <Badge background="primary" size="sm" rounded="lg" role="contentinfo">
          Unidades:{" "}
          <Text as="span" size="sm" font="bold">
            {data?.unitsAffected ?? 0}
          </Text>
        </Badge>
      </div>

      {!data?.units.length && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-6 text-center">
          <Text size="sm" font="bold">
            No hay visitantes dentro del conjunto.
          </Text>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.units.map((unit) => (
          <div
            key={unit.apartment}
            className="border border-gray-200 rounded-xl bg-white p-4"
          >
            <div className="flex items-baseline justify-between mb-2">
              <Text size="sm" font="bold">
                Apto {unit.apartment}
              </Text>
              <Text size="xs">{unit.visitors.length} persona(s)</Text>
            </div>

            <ul className="space-y-2">
              {unit.visitors.map((visitor) => (
                <li key={visitor.id} className="border-t pt-2">
                  <Text size="xs" font="bold">
                    {visitor.name}
                  </Text>
                  <Text size="xs">Doc: {visitor.document}</Text>
                  <Text size="xs">
                    Dentro hace {formatDuration(visitor.minutesInside)} ·{" "}
                    {ORIGIN_LABEL[visitor.origin] ?? visitor.origin}
                  </Text>
                  {visitor.plaque && (
                    <Text size="xs">Placa: {visitor.plaque}</Text>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
