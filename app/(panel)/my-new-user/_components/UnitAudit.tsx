"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { AUDIT_ACTION_LABEL, getUnitAudit } from "../services/statementService";

const money = (value?: number | null) =>
  value === null || value === undefined
    ? null
    : new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(value);

/** Acciones que restan plata o anulan deuda: se marcan en rojo. */
const CRITICAL_ACTIONS = ["FEE_DELETED", "PAYMENT_REJECTED", "CONFIG_DELETED"];

/**
 * Bitácora de la unidad: quién hizo qué sobre su deuda.
 *
 * La cuota solo guardaba `approvedBy` y `approvedAt`, y esos dos campos se
 * pisan en cada intento: si un comprobante se rechazaba y luego se aprobaba,
 * quedaba el rastro del último y desaparecía el del anterior. No había forma de
 * responder quién le anuló una cuota a un apartamento ni quién aprobó un abono
 * que no cuadraba.
 */
export default function UnitAudit({ relationId }: { relationId: string }) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["unit-audit", relationId, conjuntoId],
    queryFn: () => getUnitAudit(relationId, conjuntoId),
    enabled: !!relationId && !!conjuntoId,
  });

  if (isLoading) {
    return (
      <Text size="sm" className="text-gray-500">
        Cargando historial...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-red-500">
        No se pudo cargar el historial: {String(error)}
      </Text>
    );
  }

  if (!data.length) {
    return (
      <Text size="sm" className="text-gray-500">
        No hay movimientos registrados para esta unidad.
      </Text>
    );
  }

  return (
    <div className="max-h-[420px] overflow-y-auto flex flex-col gap-2 pr-1">
      {data.map((entry) => {
        const critical = CRITICAL_ACTIONS.includes(entry.action);

        return (
          <div
            key={entry.id}
            className={`rounded-lg border p-3 ${
              critical ? "border-red-200 bg-red-50" : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <Badge
                size="sm"
                colVariant={critical ? "danger" : "primary"}
                rounded="lg"
              >
                {AUDIT_ACTION_LABEL[entry.action] ?? entry.action}
              </Badge>

              <Text size="xs" className="whitespace-nowrap text-gray-500">
                {new Date(entry.createdAt).toLocaleString("es-CO")}
              </Text>
            </div>

            {entry.detail && (
              <Text size="sm" className="mt-2 text-gray-700">
                {entry.detail}
              </Text>
            )}

            {/*
              El antes/después es lo que responde la pregunta incómoda: cuánto
              valía la cuota antes de que alguien la cambiara.
            */}
            {entry.changes && Object.keys(entry.changes).length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {Object.entries(entry.changes).map(([field, change]) => (
                  <Text key={field} size="xs" className="text-gray-600">
                    <strong>{field}:</strong> {String(change.from ?? "—")} →{" "}
                    {String(change.to ?? "—")}
                  </Text>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-3">
              {entry.amount !== null && entry.amount !== undefined && (
                <Text size="xs" className="text-gray-500">
                  Monto: {money(entry.amount)}
                </Text>
              )}

              {/*
                Sin nombre de actor la entrada sigue sirviendo: el id permite
                rastrearlo aunque el usuario ya no exista.
              */}
              <Text size="xs" className="text-gray-500">
                Por: {entry.actorName ?? entry.actorId ?? "Sistema"}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}
