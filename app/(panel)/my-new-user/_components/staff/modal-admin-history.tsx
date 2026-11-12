"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { modal as m } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  AdminPeriod,
  AdminPeriodEndKind,
  AdminPeriodStartKind,
  listAdminPeriods,
} from "../../services/adminPeriodService";
import { formatDateTime, todayInBogota } from "./staff-format";
import AuditList from "./audit-list";
import { adminSuccessionService } from "@/app/(panel)/my-council/services/adminSuccessionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "periods" | "log";

const START_LABELS: Record<AdminPeriodStartKind, string> = {
  registered: "Alta",
  reactivated: "Reactivación",
  detected: "Detectado por el sistema",
  backfill: "Antes del historial",
};

const bogotaDate = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Con fecha exacta, día y hora; si es aproximada, solo el día. */
function when(iso: string, approximate: boolean): string {
  return approximate
    ? `${bogotaDate.format(new Date(iso))} (aprox.)`
    : formatDateTime(iso);
}

function endText(p: AdminPeriod): string {
  const by = p.endedByName ? ` por ${p.endedByName}` : "";
  const kinds: Record<AdminPeriodEndKind, string> = {
    retired: `Retirado${by}`,
    account_deactivated: "Desactivó su cuenta",
    role_changed: `Pasó a otro rol${by}`,
    removed: "Se borró su vínculo con el conjunto",
    detected: "Detectado por el sistema",
  };
  return p.endKind ? kinds[p.endKind] : "Terminó";
}

const tabClass = (active: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "bg-cyan-600 text-white"
      : "border border-slate-300 text-slate-700 hover:bg-slate-100"
  }`;

/**
 * Quién fue la administración del conjunto, durante cuánto tiempo y qué hizo
 * en ese tiempo. Cada administración responde por su periodo, no la que llega
 * después.
 *
 * El Modal de la librería es siempre blanco: aquí van colores claros sin
 * variante `dark:`.
 */
export default function ModalAdminHistory({ isOpen, onClose }: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [tab, setTab] = useState<Tab>("periods");
  const [at, setAt] = useState("");
  const [openPeriod, setOpenPeriod] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_periods", conjuntoId, at],
    queryFn: () => listAdminPeriods(conjuntoId, at || undefined),
    enabled: isOpen && !!conjuntoId && tab === "periods",
  });

  // Con presidente, el cambio de administración lo hace él desde el consejo.
  const { data: governance } = useQuery({
    queryKey: ["admin_governance", conjuntoId],
    queryFn: () => adminSuccessionService.governance(conjuntoId),
    enabled: isOpen && !!conjuntoId,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de administración"
      className="!w-[94%] md:!w-[640px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {governance?.hasPresident && (
          <p className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
            En este conjunto a la administración la nombra y la retira el
            presidente del consejo
            {governance.presidentName ? ` (${governance.presidentName})` : ""},
            desde Consejo → Administración.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabClass(tab === "periods")}
            onClick={() => setTab("periods")}
          >
            Periodos
          </button>
          <button
            type="button"
            className={tabClass(tab === "log")}
            onClick={() => setTab("log")}
          >
            Bitácora
          </button>
        </div>

        {tab === "log" && isOpen && (
          <>
            <p className={m.text}>
              Noticias, documentos, certificados, cuentas bancarias, convenios
              de recaudo, traspasos y residentes borrados o desactivados: quién
              lo hizo y cuándo. Empieza a registrar desde esta versión.
            </p>
            <AuditList withTypeFilter emptyText="Todavía no hay registros." />
          </>
        )}

        {tab === "periods" && (
          <>
            <p className={m.text}>
              Quién fue la administración del conjunto y durante cuánto
              tiempo. Cada administración responde por lo que autorizó en su
              periodo.
            </p>

            <div className={`${m.box} flex flex-wrap items-end gap-2`}>
              <label className="min-w-[200px] flex-1">
                <span className={m.label}>
                  ¿Quién era la administración el día…?
                </span>
                <input
                  type="date"
                  className={m.input}
                  value={at}
                  max={todayInBogota()}
                  onChange={(e) => setAt(e.target.value)}
                />
              </label>
              {at && (
                <button
                  type="button"
                  onClick={() => setAt("")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Ver todo
                </button>
              )}
            </div>

            {isLoading && <p className={m.muted}>Cargando…</p>}

            {error && (
              <p className="text-sm text-red-600">
                {error instanceof Error
                  ? error.message
                  : "No se pudo cargar el historial."}
              </p>
            )}

            {data && data.length === 0 && (
              <p className={m.muted}>
                {at
                  ? "Ese día no había administración registrada."
                  : "Todavía no hay historial."}
              </p>
            )}

            <ul className="space-y-3">
              {data?.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold ${m.strong}`}>
                        {p.adminName}
                      </p>
                      {p.adminEmail && (
                        <p className={m.muted}>{p.adminEmail}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        p.isCurrent
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p.isCurrent ? "Actual" : "Terminó"}
                    </span>
                  </div>

                  <dl className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                    <div>
                      <dt className={m.muted}>Desde</dt>
                      <dd className={m.strong}>
                        {when(p.startedAt, p.startedAtApproximate)}
                      </dd>
                      <dd className={m.muted}>
                        {START_LABELS[p.startKind]}
                        {p.startedByName ? ` · por ${p.startedByName}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className={m.muted}>Hasta</dt>
                      <dd className={m.strong}>
                        {p.endedAt
                          ? when(p.endedAt, p.endedAtApproximate)
                          : "Hoy"}
                      </dd>
                      {p.endedAt && <dd className={m.muted}>{endText(p)}</dd>}
                    </div>
                  </dl>

                  {p.endReason && (
                    <p className={`mt-2 ${m.muted}`}>Motivo: {p.endReason}</p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setOpenPeriod((current) =>
                        current === p.id ? null : p.id,
                      )
                    }
                    className="mt-3 text-sm font-medium text-cyan-700 hover:underline"
                  >
                    {openPeriod === p.id
                      ? "Ocultar lo que hizo"
                      : "Ver lo que hizo en su periodo"}
                  </button>

                  {openPeriod === p.id && (
                    <div className="mt-2">
                      <AuditList
                        showActor={false}
                        filters={{
                          actorId: p.userId,
                          from: p.startedAt,
                          to: p.endedAt ?? undefined,
                        }}
                        emptyText="No hay registros suyos en ese periodo (la bitácora empieza desde esta versión)."
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  );
}
