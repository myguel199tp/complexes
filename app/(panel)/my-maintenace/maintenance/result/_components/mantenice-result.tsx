"use client";

import { useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  useDeleteMaintenance,
  useMaintenances,
} from "../../_components/useMaintenance";
import MessageNotData from "@/app/components/messageNotData";
import { ImSpinner9 } from "react-icons/im";
import {
  FiCalendar,
  FiTool,
  FiTrash2,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import CompleteMaintenanceModal from "./CompleteMaintenanceModal";
import MaintenanceHistoryModal from "./MaintenanceHistoryModal";

export default function MaintenanceResult() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const { data, isLoading } = useMaintenances(String(conjuntoId));

  const deleteMutation = useDeleteMaintenance(String(conjuntoId));

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";

      case "OVERDUE":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const FREQ_LABELS: Record<string, string> = {
    DAILY: "Diario",
    WEEKLY: "Semanal",
    MONTHLY: "Mensual",
    QUARTERLY: "Trimestral",
    SEMIANNUAL: "Semestral",
    ANNUAL: "Anual",
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";

      case "OVERDUE":
        return "Vencido";

      default:
        return status;
    }
  };

  const calculateDaysRemaining = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <ImSpinner9 className="animate-spin text-2xl text-[#2E7D32]" />
      </div>
    );
  }

  if (!data?.length) {
    return <MessageNotData />;
  }

  return (
    <div className="mt-2 grid gap-4">
      {data.map((m) => {
        const daysRemaining = calculateDaysRemaining(
          String(m.nextMaintenanceDate),
        );

        return (
          <div
            key={m.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {m.commonArea?.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Mantenimiento programado
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  m.status,
                )}`}
              >
                {getStatusLabel(m.status)}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiTool />
                <span>
                  Proveedor:{" "}
                  <strong>{m.provider?.name || "No asignado"}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiClock />
                <span>
                  Frecuencia:{" "}
                  <strong>{FREQ_LABELS[m.frequency] || m.frequency}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiCalendar />
                <span>
                  Último mantenimiento:{" "}
                  <strong>
                    {new Date(m.lastMaintenanceDate).toLocaleDateString()}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FiCalendar />
                <span>
                  Próximo mantenimiento:{" "}
                  <strong>
                    {new Date(m.nextMaintenanceDate).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            </div>

            <div className="mt-2">
              <p
                className={`text-xs ${
                  daysRemaining >= 0 ? "text-slate-500" : "text-red-600"
                }`}
              >
                {daysRemaining >= 0
                  ? `Faltan ${daysRemaining} días`
                  : `Vencido hace ${Math.abs(daysRemaining)} días`}
              </p>
            </div>

            {m.notes && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-600">{m.notes}</p>
              </div>
            )}

            {m.completedAt && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-700" />

                  <p className="font-medium text-green-700">
                    Última ejecución registrada
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Fecha:
                  <strong>
                    {" "}
                    {new Date(m.completedAt).toLocaleDateString()}
                  </strong>
                </p>

                {m.cost && (
                  <p className="text-sm text-slate-600">
                    Costo:
                    <strong> ${m.cost.toLocaleString()}</strong>
                  </p>
                )}

                {m.invoiceNumber && (
                  <p className="text-sm text-slate-600">
                    Factura:
                    <strong> {m.invoiceNumber}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setHistoryId(String(m.id))}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Ver historial
              </button>

              <button
                onClick={() => setSelectedId(String(m.id))}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Registrar ejecución
              </button>

              <button
                onClick={() => deleteMutation.mutate(String(m.id))}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <FiTrash2 />
                Eliminar
              </button>
            </div>
          </div>
        );
      })}

      {selectedId && (
        <CompleteMaintenanceModal
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
          maintenanceId={selectedId}
          conjuntoId={String(conjuntoId)}
        />
      )}

      {historyId && (
        <MaintenanceHistoryModal
          isOpen={!!historyId}
          onClose={() => setHistoryId(null)}
          maintenanceId={historyId}
          conjuntoId={String(conjuntoId)}
        />
      )}
    </div>
  );
}
