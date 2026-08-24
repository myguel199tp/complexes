"use client";

import { useEmergencyTimeline } from "./useEmergency";
import { Text } from "complexes-next-components";

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
      <Text as="h3" font="semi" className="text-base text-slate-200">
        Línea de tiempo
      </Text>

      {isLoading && (
        <Text size="sm" className="mt-2 text-slate-400">Cargando línea de tiempo...</Text>
      )}

      {!isLoading && !data?.length && (
        <Text size="sm" className="mt-2 text-slate-400">Sin eventos todavía.</Text>
      )}

      {!!data?.length && (
        <ol className="mt-3 space-y-2 border-l border-slate-300 pl-4">
          {data.map((event) => (
            <li key={event.id} className="text-sm">
              <Text size="sm" className="font-medium text-slate-200">
                {EVENT_LABELS[event.type] || event.type}
              </Text>
              <Text size="xs" className="text-slate-400">
                {new Date(event.createdAt).toLocaleString()}
                {event.actor ? ` · ${event.actor.name} ${event.actor.lastName}` : ""}
              </Text>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
