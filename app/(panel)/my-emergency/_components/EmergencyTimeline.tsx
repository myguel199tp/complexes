"use client";

import { useEmergencyTimeline } from "./useEmergency";

const EVENT_LABELS: Record<string, string> = {
  activated: "🚨 Emergencia activada",
  notification_sent: "🔔 Notificación enviada a residentes",
  report_received: "📝 Reporte recibido",
  priority_escalated: "⚠️ Prioridad escalada",
  note_added: "🗒️ Nota agregada",
  resolved: "✅ Emergencia resuelta",
};

export default function EmergencyTimeline({
  emergencyId,
  conjuntoId,
}: {
  emergencyId: string;
  conjuntoId: string;
}) {
  const { data, isLoading } = useEmergencyTimeline(emergencyId, conjuntoId);

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-slate-200">
        Línea de tiempo
      </h3>

      {isLoading && (
        <p className="mt-2 text-sm text-slate-400">Cargando línea de tiempo...</p>
      )}

      {!isLoading && !data?.length && (
        <p className="mt-2 text-sm text-slate-400">Sin eventos todavía.</p>
      )}

      {!!data?.length && (
        <ol className="mt-3 space-y-2 border-l border-slate-300 pl-4">
          {data.map((event) => (
            <li key={event.id} className="text-sm">
              <p className="font-medium text-slate-200">
                {EVENT_LABELS[event.type] || event.type}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(event.createdAt).toLocaleString()}
                {event.actor ? ` · ${event.actor.name} ${event.actor.lastName}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
