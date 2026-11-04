"use client";

import { useState } from "react";
import {
  Callout,
  EmptyState,
  LoadingCards,
  ui,
} from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { convivenciaApi } from "../services/convivenciaService";
import {
  useCommittee,
  useCommitteeCandidates,
  useConvivenciaMutation,
} from "./use-convivencia";
import { fmtDay } from "./convivencia-format";

/**
 * Los encargados de mediar: uno o varios. La ley dice que los elige la
 * asamblea (número impar, mínimo tres, por un año); la app registra a los
 * elegidos y lo recomienda, sin impedir un comité más pequeño.
 */
export default function CommitteePanel({ isAdmin }: { isAdmin: boolean }) {
  const { data: members = [], isLoading } = useCommittee();
  const { data: candidates = [] } = useCommitteeCandidates(isAdmin);

  const [userId, setUserId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const add = useConvivenciaMutation(
    (c, body: { userId: string; periodStart?: string; periodEnd?: string }) => convivenciaApi.addMember(c, body),
    "Integrante agregado al comité",
  );
  const remove = useConvivenciaMutation(
    (c, memberUserId: string) => convivenciaApi.removeMember(c, memberUserId),
    "Integrante retirado del comité",
  );

  const available = candidates.filter((c) => !c.isMember);

  return (
    <div className="space-y-4">
      <p className={`text-sm ${ui.muted}`}>
        Los integrantes del comité son los encargados de mediar los conflictos entre vecinos.
        Ven todos los casos, citan a las partes y levantan el acta.
      </p>

      {isLoading ? (
        <LoadingCards count={2} />
      ) : !members.length ? (
        <EmptyState icon="🤝" title="El comité no tiene integrantes">
          {isAdmin
            ? "Agrega a los residentes que eligió la asamblea."
            : "La administración todavía no ha registrado el comité de convivencia."}
        </EmptyState>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {members.map((m) => (
            <li key={m.userId} className={`${ui.card} flex items-start justify-between gap-3 p-4`}>
              <div className="min-w-0">
                <p className={`font-semibold ${ui.strong}`}>{m.name}</p>
                <p className={`text-xs ${ui.muted}`}>
                  {m.unit ?? "Sin unidad"}
                  {m.periodStart || m.periodEnd
                    ? ` · ${fmtDay(m.periodStart) || "…"} a ${fmtDay(m.periodEnd) || "…"}`
                    : ""}
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(m.userId)}
                >
                  Retirar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin && members.length > 0 && (members.length < 3 || members.length % 2 === 0) && (
        <Callout tone="info">
          La Ley 675 recomienda un comité impar de tres o más personas, elegido por la asamblea por un año.
          Puedes seguir con {members.length} integrante{members.length === 1 ? "" : "s"}.
        </Callout>
      )}

      {isAdmin && (
        <form
          className={`${ui.card} grid gap-3 p-4 sm:grid-cols-4`}
          onSubmit={async (e) => {
            e.preventDefault();
            await add.mutateAsync({
              userId,
              periodStart: periodStart || undefined,
              periodEnd: periodEnd || undefined,
            });
            setUserId("");
          }}
        >
          <label className="block sm:col-span-2">
            <span className={ui.label}>Residente</span>
            <select className={ui.input} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Selecciona…</option>
              {available.map((c) => (
                <option key={c.userId} value={c.userId}>
                  {c.name}
                  {c.unit ? ` · ${c.unit}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={ui.label}>Desde</span>
            <input type="date" className={`${ui.input} dark:[color-scheme:dark]`} value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </label>
          <label className="block">
            <span className={ui.label}>Hasta</span>
            <input type="date" className={`${ui.input} dark:[color-scheme:dark]`} value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </label>
          <div className="flex justify-end sm:col-span-4">
            <button
              type="submit"
              disabled={!userId || add.isPending}
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {add.isPending ? "Agregando…" : "Agregar al comité"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
