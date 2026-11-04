"use client";

import { useState } from "react";
import {
  EmptyState,
  LoadingCards,
  Pill,
  ui,
} from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useCases } from "./use-convivencia";
import { STATUS_OPTIONS, STATUS_TONE, fmtDateTime, fmtDay } from "./convivencia-format";

interface Props {
  onOpen: (caseId: string) => void;
  /** El comité y la administración ven todos; el resto, los suyos. */
  seesAll: boolean;
}

export default function CaseList({ onOpen, seesAll }: Props) {
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useCases(status || undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${ui.muted}`}>
          {seesAll
            ? "Todos los casos del conjunto."
            : "Los casos que radicaste y aquellos en los que tu unidad fue convocada."}
        </p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${ui.input} !w-auto`}
          aria-label="Filtrar por estado"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingCards />
      ) : error ? (
        <EmptyState icon="⚠️" title="No pudimos cargar los casos">
          {(error as Error).message}
        </EmptyState>
      ) : !data?.length ? (
        <EmptyState icon="🤝" title="No hay casos">
          {status ? "Ningún caso en ese estado." : "Aún no hay casos de convivencia."}
        </EmptyState>
      ) : (
        <ul className="grid gap-3">
          {data.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onOpen(c.id)}
                className={`${ui.card} block w-full p-4 text-left transition hover:border-cyan-400 dark:hover:border-cyan-400/60`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-bold ${ui.title}`}>Caso #{c.number}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {c.iAmPetitioner && <Pill tone="info">Lo radicaste</Pill>}
                    {c.iAmRespondent && <Pill tone="warning">Tu unidad fue convocada</Pill>}
                    <Pill tone={STATUS_TONE[c.status]}>{c.statusLabel}</Pill>
                  </div>
                </div>
                <p className={`mt-1 text-xs ${ui.faint}`}>
                  Radicado {fmtDateTime(c.createdAt)}
                  {c.incidentDate ? ` · Hechos del ${fmtDay(c.incidentDate)}` : ""}
                  {c.hearingAt ? ` · Sesión: ${fmtDateTime(c.hearingAt)}` : ""}
                </p>
                <p className={`mt-2 text-sm ${ui.text}`}>
                  <span className="font-medium">{c.petitionerName}</span>
                  {c.petitionerUnit ? ` (${c.petitionerUnit})` : ""} →{" "}
                  <span className="font-medium">
                    {[c.respondentUnit, c.respondentDescription].filter(Boolean).join(" — ") ||
                      "convocado sin indicar"}
                  </span>
                </p>
                <p className={`mt-1 line-clamp-2 text-sm ${ui.muted}`}>{c.summary}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
