"use client";

import {
  Callout,
  EmptyState,
  Fact,
  LoadingCards,
  Pill,
  ui,
} from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useCase } from "./use-convivencia";
import CaseActions from "./case-actions";
import {
  ACTOR_LABEL,
  EVENT_LABEL,
  STATUS_TONE,
  fmtDateTime,
  fmtDay,
} from "./convivencia-format";

interface Props {
  caseId: string;
  onBack: () => void;
}

export default function CaseDetailView({ caseId, onBack }: Props) {
  const { data, isLoading, error } = useCase(caseId);

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className={`text-sm ${ui.link}`}>
        ← Volver a los casos
      </button>

      {isLoading ? (
        <LoadingCards count={2} />
      ) : error || !data ? (
        <EmptyState icon="⚠️" title="No pudimos abrir el caso">
          {(error as Error)?.message}
        </EmptyState>
      ) : (
        <>
          <header className={`${ui.card} space-y-4 p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className={`text-xl font-bold ${ui.title}`}>Caso #{data.number}</h1>
              <div className="flex flex-wrap gap-2">
                {data.viewer.isPetitioner && <Pill tone="info">Lo radicaste</Pill>}
                {data.viewer.isRespondent && <Pill tone="warning">Tu unidad fue convocada</Pill>}
                <Pill tone={STATUS_TONE[data.status]}>{data.statusLabel}</Pill>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Peticionario">
                {data.petitionerName}
                {data.petitionerResidentType ? ` · ${data.petitionerResidentType}` : ""}
                {data.petitionerUnit ? (
                  <span className={`block text-xs font-normal ${ui.muted}`}>{data.petitionerUnit}</span>
                ) : null}
              </Fact>
              {data.capabilities.seePrivate && (
                <Fact label="Contacto del peticionario">
                  {[data.petitionerDocument && `C.C. ${data.petitionerDocument}`, data.petitionerPhone, data.petitionerEmail]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </Fact>
              )}
              <Fact label="Convocado">
                {[data.respondentUnit, data.respondentDescription].filter(Boolean).join(" — ") || "Sin indicar"}
              </Fact>
              <Fact label="Fecha de los hechos">{fmtDay(data.incidentDate) || "—"}</Fact>
              <Fact label="Radicado">{fmtDateTime(data.createdAt)}</Fact>
              <Fact label="Encargados del comité">
                {data.mediators.length ? data.mediators.map((m) => m.name).join(", ") : "Sin asignar"}
              </Fact>
              {data.hearingAt && (
                <Fact label="Sesión de conciliación">
                  {fmtDateTime(data.hearingAt)}
                  {data.hearingPlace ? ` · ${data.hearingPlace}` : ""}
                </Fact>
              )}
              {data.descargosDeadline && (
                <Fact label="Plazo de descargos">{fmtDateTime(data.descargosDeadline)}</Fact>
              )}
              {data.appealDeadline && (
                <Fact label="Plazo para apelar">{fmtDateTime(data.appealDeadline)}</Fact>
              )}
            </div>

            <div>
              <span className={`block text-[11px] uppercase tracking-wide ${ui.faint}`}>Resumen del caso</span>
              <p className={`mt-1 whitespace-pre-line text-sm ${ui.text}`}>{data.summary}</p>
            </div>

            {data.outcome && (
              <Callout tone={data.status === "no_agreement" ? "warning" : "success"} title="Acta">
                <span className="whitespace-pre-line">{data.outcome}</span>
              </Callout>
            )}

            {data.appealDecision && (
              <Callout tone={data.appealDecision === "revoked" ? "success" : "neutral"} title="Apelación">
                {data.appealDecision === "revoked" ? "Sanción revocada." : "Sanción confirmada."}
              </Callout>
            )}

            {data.closedReason && data.status === "closed" && (
              <p className={`text-sm ${ui.muted}`}>
                Cerrado {fmtDateTime(data.closedAt)}: {data.closedReason}
              </p>
            )}
          </header>

          <CaseActions data={data} />

          <section className="space-y-3">
            <h2 className={`text-base font-bold ${ui.title}`}>Línea de tiempo</h2>
            <ol className="relative space-y-4 border-l border-slate-200 pl-5 dark:border-white/10">
              {data.events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-semibold ${ui.strong}`}>{EVENT_LABEL[event.type]}</span>
                    {event.internal && <Pill tone="neutral">Interna</Pill>}
                    {event.late && <Pill tone="warning">Fuera de plazo</Pill>}
                  </div>
                  <p className={`text-xs ${ui.faint}`}>
                    {fmtDateTime(event.createdAt)}
                    {event.actorName ? ` · ${event.actorName}` : ""}
                    {event.actorRole ? ` (${ACTOR_LABEL[event.actorRole]})` : ""}
                  </p>
                  {event.text ? (
                    <p className={`mt-1 whitespace-pre-line text-sm ${ui.text}`}>{event.text}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
