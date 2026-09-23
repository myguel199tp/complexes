"use client";

import React, { useMemo, useState } from "react";
import { Badge, Text } from "complexes-next-components";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useSession } from "@/app/components/session-provider";
import { useCoefficientsQuery } from "../../my-fees/_components/use-coefficients-query";
import ModalEditRelation from "./modal/modal-edit-relation";

interface Props {
  /** Censo ya cargado en /my-new-user; evita una segunda consulta. */
  users: EnsembleResponse[];
}

/**
 * Estado de los coeficientes de copropiedad del conjunto, en el mismo sitio
 * donde se administran las unidades.
 *
 * El coeficiente es lo que /my-fees multiplica por el monto base al generar la
 * cartera, pero hasta ahora solo lo escribía la carga masiva por CSV: un
 * conjunto dado de alta a mano quedaba con todas las unidades en el default
 * `1`, el generador avisaba "ninguna unidad tiene coeficiente configurado" y
 * no había forma de saber desde el panel cuáles faltaban ni dónde ponerlos.
 */
export default function CoefficientsPanel({ users }: Props) {
  const { session } = useSession();
  const isStaff = !!session?.roles?.includes("employee");

  // El endpoint es solo para administración; para el resto daría 403.
  const { data, isLoading } = useCoefficientsQuery(isStaff);

  const [editing, setEditing] = useState<EnsembleResponse | null>(null);

  // La relación pendiente se resuelve contra el censo ya cargado: la modal de
  // edición trabaja sobre el objeto completo, no sobre el id suelto.
  const byRelationId = useMemo(() => {
    const map = new Map<string, EnsembleResponse>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  if (!isStaff || isLoading || !data) return null;

  const { pending, percent, units, isBalanced, configured } = data;
  const configuredUnits = units - pending.length;
  const allSet = pending.length === 0;

  const unitLabel = (tower?: string | null, apartment?: string | null) =>
    [tower, apartment].filter(Boolean).join("-") || "Sin unidad";

  return (
    <>
      <div
        className={`mt-4 rounded-lg border p-3 ${
          allSet && isBalanced
            ? "border-green-200 bg-green-50"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Text size="sm" font="semi" className="text-gray-800">
            Coeficientes de copropiedad
          </Text>

          <Badge
            size="sm"
            rounded="lg"
            colVariant={isBalanced ? "success" : "warning"}
          >
            {configuredUnits} de {units} configuradas
          </Badge>

          {configured && (
            <Badge
              size="sm"
              rounded="lg"
              colVariant={isBalanced ? "success" : "danger"}
            >
              Suman {percent}%
            </Badge>
          )}
        </div>

        {allSet ? (
          <Text size="xs" className="mt-1 text-gray-600">
            {isBalanced
              ? "Todas las unidades tienen coeficiente y suman 100%."
              : `Todas las unidades tienen coeficiente, pero suman ${percent}% en lugar de 100%. Revísalos: con esta suma el recaudo no cubre el presupuesto.`}
          </Text>
        ) : (
          <>
            <Text size="xs" className="mt-1 text-gray-600">
              Estas unidades pagarían el monto base completo al generar la
              cartera. Haz clic en una para escribir su porcentaje; entre todas
              deben sumar 100%.
            </Text>

            <div className="mt-2 flex flex-wrap gap-2">
              {pending.map((unit) => {
                const relation = byRelationId.get(unit.relationId);

                return (
                  <button
                    key={unit.relationId}
                    type="button"
                    disabled={!relation}
                    onClick={() => relation && setEditing(relation)}
                    title={unit.name || undefined}
                    className="rounded-full border border-yellow-300 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {unitLabel(unit.tower, unit.apartment)}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ModalEditRelation
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        selectedUser={editing}
        section="user"
      />
    </>
  );
}
