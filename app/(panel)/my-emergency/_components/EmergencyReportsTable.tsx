"use client";

import React, { useState } from "react";
import { SelectField } from "complexes-next-components";
import { EmergencyPriority } from "../services/response/emergencyResponse";
import { useEmergencyReports } from "./useEmergency";

const PRIORITY_BADGE: Record<EmergencyPriority, string> = {
  [EmergencyPriority.CRITICAL]: "🔴 Crítico",
  [EmergencyPriority.HIGH]: "🟠 Alto",
  [EmergencyPriority.MEDIUM]: "🟡 Medio",
  [EmergencyPriority.NONE]: "🟢 Sin novedad",
};

export default function EmergencyReportsTable({
  emergencyId,
  conjuntoId,
}: {
  emergencyId: string;
  conjuntoId: string;
}) {
  const [priority, setPriority] = useState<string>("");
  const [tower, setTower] = useState("");

  const { data, isLoading } = useEmergencyReports(emergencyId, conjuntoId, {
    priority: (priority || undefined) as EmergencyPriority | undefined,
    tower: tower || undefined,
  });

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-slate-200">Reportes</h3>

      <div className="mt-2 flex flex-wrap gap-3">
        <SelectField
          label="Prioridad"
          inputSize="md"
          rounded="md"
          options={[
            { label: "Todas", value: "" },
            { label: "Crítico", value: EmergencyPriority.CRITICAL },
            { label: "Alto", value: EmergencyPriority.HIGH },
            { label: "Medio", value: EmergencyPriority.MEDIUM },
            { label: "Sin novedad", value: EmergencyPriority.NONE },
          ]}
          value={priority}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setPriority(e.target.value)
          }
        />

        <input
          placeholder="Filtrar por torre"
          value={tower}
          onChange={(e) => setTower(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="mt-2 text-sm text-slate-400">Cargando reportes...</p>}

      {!isLoading && !data?.length && (
        <p className="mt-2 text-sm text-slate-400">Aún no hay reportes.</p>
      )}

      {!!data?.length && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">Residente</th>
                <th className="px-3 py-2 text-left">Torre/Apto</th>
                <th className="px-3 py-2 text-left">Prioridad</th>
                <th className="px-3 py-2 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((report) => (
                <tr key={report.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    {report.user?.name} {report.user?.lastName}
                  </td>
                  <td className="px-3 py-2">
                    {report.tower ?? "-"} / {report.apartment ?? "-"}
                  </td>
                  <td className="px-3 py-2">{PRIORITY_BADGE[report.priority]}</td>
                  <td className="px-3 py-2">
                    {report.freeTextNotes || report.vulnerablePeopleDetail || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
