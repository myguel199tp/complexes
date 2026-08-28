"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Title, Text } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import PlanFeatureGate from "../../_components/plan-feature-gate";
import {
  B2bMaintenance,
  FREQUENCY_LABELS,
  getB2bMaintenances,
} from "../services/b2bMaintenanceService";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

/** Días que faltan (negativo si ya pasó), contra el inicio del día de hoy. */
function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(value);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function dueLabel(item: B2bMaintenance) {
  const diff = daysUntil(item.nextMaintenanceDate);
  if (diff < 0) return `Vencido hace ${Math.abs(diff)} día(s)`;
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return `En ${diff} días`;
}

function ComercioB2bAgendaPage() {
  const router = useRouter();
  const [conjuntoId, setConjuntoId] = useState<string>("all");

  useComercioGuard(() => router.push("/comercio/login"));

  const { data: maintenances, isLoading } = useQuery({
    queryKey: ["comercio_b2b_maintenances"],
    queryFn: getB2bMaintenances,
  });

  // Los conjuntos salen de la propia agenda: no hace falta otra consulta para
  // saber dónde tiene servicios este comercio.
  const conjuntos = useMemo(() => {
    const map = new Map<string, string>();
    (maintenances ?? []).forEach((m) => map.set(m.conjuntoId, m.conjuntoName));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [maintenances]);

  const rows = (maintenances ?? []).filter(
    (m) => conjuntoId === "all" || m.conjuntoId === conjuntoId,
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-2">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Agenda de servicios
          </Title>
          <Link
            href="/comercio/dashboard"
            className="text-cyan-300 text-sm hover:text-cyan-200"
          >
            Volver al panel
          </Link>
        </div>

        <Text size="sm" className="mt-2 text-slate-400">
          Estos son los mantenimientos que los conjuntos tienen programados
          contigo. Marcar un servicio como realizado y adjuntar la evidencia lo
          hace la administración del conjunto, no el comercio.
        </Text>

        {conjuntos.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setConjuntoId("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                conjuntoId === "all"
                  ? "bg-purple-500/25 text-purple-200"
                  : "bg-white/[0.06] text-slate-400 hover:bg-white/[0.1]"
              }`}
            >
              Todos
            </button>
            {conjuntos.map((c) => (
              <button
                key={c.id}
                onClick={() => setConjuntoId(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  conjuntoId === c.id
                    ? "bg-purple-500/25 text-purple-200"
                    : "bg-white/[0.06] text-slate-400 hover:bg-white/[0.1]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <Text size="sm" className="mt-6 text-slate-400">Cargando...</Text>
        ) : rows.length === 0 ? (
          <Text size="sm" className="mt-6 text-slate-400">
            Todavía no tienes servicios programados. Aparecerán aquí cuando un
            conjunto agende un mantenimiento a tu nombre.
          </Text>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {rows.map((m) => {
              const overdue = m.status === "OVERDUE";
              return (
                <li
                  key={m.id}
                  className={`rounded-2xl border p-4 ${
                    overdue
                      ? "border-red-500/30 bg-red-500/[0.06]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Text size="sm" font="semi" className="text-slate-100">
                        {m.commonAreaName}
                      </Text>
                      <Text size="sm" className="text-slate-400">{m.conjuntoName}</Text>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        overdue
                          ? "bg-red-500/20 text-red-300"
                          : "bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      {dueLabel(m)}
                    </span>
                  </div>

                  <Text size="sm" className="mt-3 text-slate-400">
                    📅 {formatDate(m.nextMaintenanceDate)} ·{" "}
                    {FREQUENCY_LABELS[m.frequency] ?? m.frequency}
                  </Text>

                  {m.notes && (
                    <Text size="sm" className="mt-2 text-slate-500">{m.notes}</Text>
                  )}

                  {!m.providerActive && (
                    <Text size="xs" className="mt-2 text-amber-300">
                      Tu alianza con este conjunto no está vigente. Revisa el
                      estado del contrato antes de presentarte.
                    </Text>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * La pantalla vive detrás del plan: si el plan de acceso del comercio no la
 * incluye, se explica en lugar de dejarlo chocar con el 403 del backend.
 */
export default function ComercioB2bAgendaPageGated() {
  return (
    <PlanFeatureGate feature="agenda">
      <ComercioB2bAgendaPage />
    </PlanFeatureGate>
  );
}
