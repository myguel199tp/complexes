"use client";

import React, { useState } from "react";
import { Text } from "complexes-next-components";
import { MdInfoOutline } from "react-icons/md";
import {
  useMarkProfileChangesSeen,
  useProfileChangesQuery,
} from "./use-profile-changes-query";
import type { ProfileChangeLogItem } from "../services/profileChangeLogService";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sectionLabel(section: ProfileChangeLogItem["section"]): string {
  return section === "vehicles" ? "Vehículos" : "Información personal";
}

/**
 * Aviso de que la administración modificó los datos del residente. El objetivo
 * es que ningún cambio hecho desde el panel pase desapercibido: se muestra qué
 * campo cambió, con qué valor quedaba antes y quién lo hizo.
 */
export default function ProfileChangesNotice() {
  const { data, isLoading } = useProfileChangesQuery();
  const markSeen = useMarkProfileChangesSeen();
  const [expanded, setExpanded] = useState(false);

  const items = data?.items ?? [];

  if (isLoading || items.length === 0) return null;

  const unseen = data?.unseen ?? 0;
  const last = items[0];

  return (
    <div
      className={`
        mb-4 rounded-lg border p-4
        ${
          unseen > 0
            ? "border-amber-300 bg-amber-50"
            : "border-gray-200 bg-gray-50"
        }
      `}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <MdInfoOutline
            className={`mt-1 shrink-0 text-lg ${
              unseen > 0 ? "text-amber-600" : "text-gray-500"
            }`}
          />

          <div className="min-w-0">
            <Text size="sm" font="semi" className="text-gray-800">
              {unseen > 0
                ? `La administración actualizó tus datos (${unseen} ${
                    unseen === 1 ? "cambio nuevo" : "cambios nuevos"
                  })`
                : "Historial de cambios en tus datos"}
            </Text>

            <Text size="sm" className="text-gray-600 mt-1">
              Último cambio en {sectionLabel(last.section)} el{" "}
              {formatDate(last.createdAt)}
              {last.changedByName ? ` por ${last.changedByName}` : ""}.
            </Text>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="
              rounded-md border border-gray-300 bg-white px-3 py-1 text-sm
              text-gray-700 transition-colors hover:bg-gray-100
            "
          >
            {expanded ? "Ocultar detalle" : "Ver detalle"}
          </button>

          {unseen > 0 && (
            <button
              type="button"
              onClick={() => markSeen.mutate()}
              disabled={markSeen.isPending}
              className="
                rounded-md bg-amber-600 px-3 py-1 text-sm text-white
                transition-colors hover:bg-amber-700
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {markSeen.isPending ? "Guardando..." : "Marcar como visto"}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-gray-200 bg-white p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text size="xs" font="semi" className="text-gray-700">
                  {sectionLabel(item.section)}
                </Text>

                <Text size="xs" className="text-gray-500">
                  {formatDate(item.createdAt)}
                  {item.changedByName ? ` · ${item.changedByName}` : ""}
                </Text>
              </div>

              <ul className="mt-2 space-y-1">
                {item.changes.map((change, index) => (
                  <li key={`${item.id}-${change.field}-${index}`}>
                    <Text size="xs" className="text-gray-600">
                      <span className="font-semibold">{change.label}:</span>{" "}
                      <span className="line-through text-gray-400">
                        {change.before ?? "—"}
                      </span>{" "}
                      → <span className="text-gray-800">{change.after ?? "—"}</span>
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Text size="xs" className="text-gray-500">
            Si no reconoces alguno de estos cambios, comunícate con la
            administración de tu conjunto.
          </Text>
        </div>
      )}
    </div>
  );
}
