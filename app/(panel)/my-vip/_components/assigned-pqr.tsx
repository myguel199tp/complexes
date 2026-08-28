"use client";

import React from "react";
import { Text } from "complexes-next-components";
import { useAssignedPqrQuery } from "./use-assigned-pqr-query";
import { AllPqrStatus } from "../../my-all-pqr/services/response/AllPqrResponse";
import { fileUrl } from "@/app/helpers/fileUrl";

const STATUS_BADGE: Record<AllPqrStatus, { label: string; className: string }> =
  {
    pendiente: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800",
    },
    en_proceso: { label: "En proceso", className: "bg-blue-100 text-blue-800" },
    aceptada: { label: "Aceptada", className: "bg-green-100 text-green-800" },
    rechazada: { label: "Rechazada", className: "bg-red-100 text-red-800" },
  };

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Peticiones que la administración derivó a este colaborador al responderlas.
 *
 * El colaborador no entra a /my-all-pqr —ese panel es de la administración—,
 * así que sin esto se enteraba de palabra de lo que le tocaba ejecutar.
 */
export default function AssignedPqr() {
  const { data, isLoading, error } = useAssignedPqrQuery();

  // Si el backend todavía no expone el endpoint no vale la pena romper el
  // perfil entero: es una sección secundaria.
  if (error) return null;

  if (isLoading) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <Text size="sm" className="text-gray-400">
          Cargando peticiones asignadas...
        </Text>
      </div>
    );
  }

  const petitions = data ?? [];

  if (petitions.length === 0) return null;

  return (
    <div className="bg-white border rounded-xl p-6 space-y-3">
      <Text font="bold" size="lg">
        Peticiones asignadas a mí
        <span className="ml-2 text-xs font-normal text-gray-500">
          ({petitions.length})
        </span>
      </Text>

      <div className="space-y-3">
        {petitions.map((pqr) => {
          const badge = STATUS_BADGE[pqr.status] ?? STATUS_BADGE.pendiente;
          const pdf = fileUrl(pqr.file);
          const assignedOn = formatDate(pqr.assignedAt);

          return (
            <div
              key={pqr.id}
              className="p-4 rounded-lg border bg-gray-50 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text font="semi" size="sm">
                  {pqr.type} - {pqr.radicado}
                </Text>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              <Text size="xs" className="text-gray-500">
                Torre {pqr.tower || "-"} · Apto {pqr.apartment || "-"}
                {assignedOn ? ` · Asignada el ${assignedOn}` : ""}
              </Text>

              <Text size="sm" className="text-gray-700">
                {pqr.description}
              </Text>

              {pqr.resolution && (
                <div className="rounded-md border-l-4 border-cyan-600 bg-white p-3">
                  <Text size="xs" font="bold" className="text-cyan-800">
                    Respuesta de la administración
                    {pqr.resolvedBy ? ` (${pqr.resolvedBy})` : ""}
                  </Text>
                  <Text size="sm" className="text-gray-700">
                    {pqr.resolution}
                  </Text>
                </div>
              )}

              {pdf && (
                <a
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline w-fit"
                >
                  Ver PDF
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
