"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Callout, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { convivenciaApi } from "../services/convivenciaService";
import { CaseDetail, SanctionRequest } from "../services/convivenciaTypes";
import { useCommittee, useConvivenciaMutation } from "./use-convivencia";
import { bogotaToIso, fmtDateTime, isPast } from "./convivencia-format";

const button =
  "rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50";

/** Una acción plegable: se abre, se llena y se envía. */
function ActionBox({
  title,
  hint,
  highlight,
  children,
}: {
  title: string;
  hint?: ReactNode;
  highlight?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(!!highlight);

  return (
    <div
      className={`rounded-xl border ${
        highlight
          ? "border-amber-300 bg-amber-50/60 dark:border-amber-400/30 dark:bg-amber-400/[0.06]"
          : ui.divider
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className={`block text-sm font-semibold ${ui.strong}`}>{title}</span>
          {hint ? <span className={`block text-xs ${ui.muted}`}>{hint}</span> : null}
        </span>
        <span className={`text-xs ${ui.faint}`}>{open ? "Cerrar" : "Abrir"}</span>
      </button>
      {open ? <div className="border-t px-4 py-3 dark:border-white/10">{children(() => setOpen(false))}</div> : null}
    </div>
  );
}

/** Formulario de un solo texto (descargos, apelación, remisión, cierre…). */
function TextAction({
  placeholder,
  submitLabel,
  minLength = 3,
  onSubmit,
  pending,
  extra,
}: {
  placeholder: string;
  submitLabel: string;
  minLength?: number;
  onSubmit: (text: string) => Promise<unknown>;
  pending: boolean;
  extra?: ReactNode;
}) {
  const [text, setText] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {extra}
      <textarea
        className={`${ui.input} min-h-[110px]`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex justify-end">
        <button type="submit" className={button} disabled={pending || text.trim().length < minLength}>
          {pending ? "Enviando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

type TextActionName = Parameters<typeof convivenciaApi.text>[2];

export default function CaseActions({ data }: { data: CaseDetail }) {
  const can = data.capabilities;
  const caseId = data.id;

  const textAction = useConvivenciaMutation(
    (c, v: { action: TextActionName; text: string }) => convivenciaApi.text(c, caseId, v.action, v.text),
    "Listo, quedó en el caso",
  );
  const note = useConvivenciaMutation(
    (c, v: { text: string; internal: boolean }) => convivenciaApi.note(c, caseId, v.text, v.internal),
    "Nota agregada",
  );
  const assign = useConvivenciaMutation(
    (c, ids: string[]) => convivenciaApi.assign(c, caseId, ids),
    "Encargados asignados",
  );
  const respondent = useConvivenciaMutation(
    (c, body: { tower?: string; apartment?: string; description?: string }) =>
      convivenciaApi.respondent(c, caseId, body),
    "Convocado actualizado",
  );
  const summon = useConvivenciaMutation(
    (c, body: { hearingAt: string; hearingPlace?: string; descargosDeadline?: string }) =>
      convivenciaApi.summon(c, caseId, body),
    "Citación enviada a las partes",
  );
  const outcome = useConvivenciaMutation(
    (c, v: { result: "agreement" | "no_agreement"; text: string }) =>
      convivenciaApi.outcome(c, caseId, v.result, v.text),
    "Acta registrada",
  );
  const sanction = useConvivenciaMutation(
    (c, body: SanctionRequest) => convivenciaApi.sanction(c, caseId, body),
    "Sanción impuesta",
  );
  const resolve = useConvivenciaMutation(
    (c, v: { decision: "confirmed" | "revoked"; text: string }) =>
      convivenciaApi.resolveAppeal(c, caseId, v.decision, v.text),
    "Apelación resuelta",
  );

  const runText = (action: TextActionName) => (text: string) => textAction.mutateAsync({ action, text });

  const anything = Object.entries(can).some(([k, v]) => v && k !== "view" && k !== "seePrivate");
  if (!anything) return null;

  return (
    <section className="space-y-2">
      <h2 className={`text-base font-bold ${ui.title}`}>Acciones</h2>

      {can.descargos && (
        <ActionBox
          title="Presentar descargos"
          highlight
          hint={
            data.descargosDeadline
              ? `${isPast(data.descargosDeadline) ? "El plazo venció el" : "Plazo:"} ${fmtDateTime(data.descargosDeadline)}`
              : "Tu versión de los hechos, antes de que se decida el caso."
          }
        >
          {() => (
            <TextAction
              placeholder="Cuenta tu versión de los hechos. Quedará en el caso y la leerá el comité."
              submitLabel="Enviar descargos"
              onSubmit={runText("descargos")}
              pending={textAction.isPending}
              extra={
                isPast(data.descargosDeadline) ? (
                  <Callout tone="warning">
                    El plazo ya venció: tus descargos se reciben, pero quedan marcados como presentados fuera de tiempo.
                  </Callout>
                ) : null
              }
            />
          )}
        </ActionBox>
      )}

      {can.appeal && (
        <ActionBox
          title="Apelar la sanción"
          highlight
          hint={`Hasta ${fmtDateTime(data.appealDeadline)}. La resuelve el presidente del consejo.`}
        >
          {() => (
            <TextAction
              placeholder="Explica por qué no estás de acuerdo con la sanción."
              submitLabel="Apelar"
              minLength={10}
              onSubmit={runText("appeal")}
              pending={textAction.isPending}
            />
          )}
        </ActionBox>
      )}

      {can.resolveAppeal && (
        <ActionBox title="Resolver la apelación" highlight hint="Confirma la sanción o revócala. Revocar anula la multa o el llamado.">
          {() => <ResolveAppealForm pending={resolve.isPending} onSubmit={(v) => resolve.mutateAsync(v)} />}
        </ActionBox>
      )}

      {can.assign && (
        <ActionBox title="Asignar encargados" hint="Uno o varios integrantes del comité llevan el caso.">
          {(close) => (
            <AssignForm
              current={data.mediatorUserIds}
              pending={assign.isPending}
              onSubmit={async (ids) => {
                await assign.mutateAsync(ids);
                close();
              }}
            />
          )}
        </ActionBox>
      )}

      {can.summon && (
        <ActionBox title={data.hearingAt ? "Reprogramar la citación" : "Citar a las partes"} hint="A las dos partes les llega la citación por correo.">
          {(close) => (
            <SummonForm
              pending={summon.isPending}
              onSubmit={async (body) => {
                await summon.mutateAsync(body);
                close();
              }}
            />
          )}
        </ActionBox>
      )}

      {can.recordOutcome && (
        <ActionBox title="Levantar el acta" hint="Lo que resultó de la sesión: acuerdo o no.">
          {(close) => (
            <OutcomeForm
              pending={outcome.isPending}
              onSubmit={async (v) => {
                await outcome.mutateAsync(v);
                close();
              }}
            />
          )}
        </ActionBox>
      )}

      {can.escalate && (
        <ActionBox
          title="Remitir para sanción"
          hint="El comité no sanciona: remite a la administración, que decide si pone un llamado de atención o una multa."
        >
          {() => (
            <TextAction
              placeholder="Por qué se remite (sin acuerdo, acuerdo incumplido…)."
              submitLabel="Remitir"
              onSubmit={runText("escalate")}
              pending={textAction.isPending}
            />
          )}
        </ActionBox>
      )}

      {can.sanction && (
        <ActionBox title="Imponer sanción" highlight hint="Sobre la unidad convocada. El convocado tendrá un plazo para apelar.">
          {() => <SanctionForm pending={sanction.isPending} onSubmit={(body) => sanction.mutateAsync(body)} />}
        </ActionBox>
      )}

      {data.status === "escalated" && data.viewer.isAdmin && !data.respondentRelationId && (
        <Callout tone="warning">Para sancionar, primero indica la unidad del convocado.</Callout>
      )}

      {can.editRespondent && (
        <ActionBox title="Cambiar el convocado" hint="Torre y apartamento, o una descripción.">
          {(close) => (
            <RespondentForm
              pending={respondent.isPending}
              onSubmit={async (body) => {
                await respondent.mutateAsync(body);
                close();
              }}
            />
          )}
        </ActionBox>
      )}

      {can.petitionerNote && (
        <ActionBox title="Ampliar el caso" hint="Agrega información o hechos nuevos.">
          {() => (
            <TextAction
              placeholder="Lo nuevo que quieras que el comité sepa."
              submitLabel="Agregar"
              onSubmit={runText("petitioner-note")}
              pending={textAction.isPending}
            />
          )}
        </ActionBox>
      )}

      {can.note && (
        <ActionBox title="Agregar nota" hint="Nota del comité o la administración.">
          {() => <NoteForm pending={note.isPending} onSubmit={(v) => note.mutateAsync(v)} />}
        </ActionBox>
      )}

      {can.withdraw && (
        <ActionBox title="Desistir del caso" hint="Si ya se solucionó o no quieres seguir.">
          {() => (
            <TextAction
              placeholder="Por qué desistes."
              submitLabel="Desistir"
              onSubmit={runText("withdraw")}
              pending={textAction.isPending}
            />
          )}
        </ActionBox>
      )}

      {can.close && (
        <ActionBox title="Cerrar el caso" hint="Las partes reciben el motivo por correo.">
          {() => (
            <TextAction
              placeholder="Motivo del cierre."
              submitLabel="Cerrar caso"
              onSubmit={runText("close")}
              pending={textAction.isPending}
            />
          )}
        </ActionBox>
      )}
    </section>
  );
}

function AssignForm({
  current,
  pending,
  onSubmit,
}: {
  current: string[];
  pending: boolean;
  onSubmit: (ids: string[]) => Promise<void>;
}) {
  const { data: members = [] } = useCommittee();
  const [selected, setSelected] = useState<string[]>(current);

  if (!members.length) {
    return <Callout tone="warning">El comité no tiene integrantes. La administración los agrega en la pestaña Comité.</Callout>;
  }

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {members.map((m) => (
          <li key={m.userId}>
            <label className={`flex items-center gap-2 text-sm ${ui.text}`}>
              <input type="checkbox" checked={selected.includes(m.userId)} onChange={() => toggle(m.userId)} />
              {m.name}
              {m.unit ? <span className={ui.faint}>· {m.unit}</span> : null}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <button type="button" className={button} disabled={pending || !selected.length} onClick={() => onSubmit(selected)}>
          {pending ? "Guardando…" : "Asignar"}
        </button>
      </div>
    </div>
  );
}

function SummonForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (body: { hearingAt: string; hearingPlace?: string; descargosDeadline?: string }) => Promise<void>;
}) {
  const [hearingAt, setHearingAt] = useState("");
  const [place, setPlace] = useState("");
  const [deadline, setDeadline] = useState("");

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          hearingAt: bogotaToIso(hearingAt),
          hearingPlace: place || undefined,
          descargosDeadline: deadline ? bogotaToIso(deadline) : undefined,
        });
      }}
    >
      <label className="block">
        <span className={ui.label}>Fecha y hora de la sesión</span>
        <input type="datetime-local" className={`${ui.input} dark:[color-scheme:dark]`} value={hearingAt} onChange={(e) => setHearingAt(e.target.value)} />
      </label>
      <label className="block">
        <span className={ui.label}>Lugar</span>
        <input className={ui.input} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Salón comunal, videollamada…" />
      </label>
      <label className="block sm:col-span-2">
        <span className={ui.label}>Plazo para descargos (si no, vence a la hora de la sesión)</span>
        <input type="datetime-local" className={`${ui.input} dark:[color-scheme:dark] sm:max-w-xs`} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </label>
      <div className="flex justify-end sm:col-span-2">
        <button type="submit" className={button} disabled={pending || !hearingAt}>
          {pending ? "Citando…" : "Enviar citación"}
        </button>
      </div>
    </form>
  );
}

function OutcomeForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (v: { result: "agreement" | "no_agreement"; text: string }) => Promise<void>;
}) {
  const [result, setResult] = useState<"agreement" | "no_agreement">("agreement");

  return (
    <TextAction
      placeholder={result === "agreement" ? "Qué acordaron las partes y en qué plazos." : "Qué se discutió y por qué no hubo acuerdo."}
      submitLabel="Registrar acta"
      minLength={10}
      pending={pending}
      onSubmit={(text) => onSubmit({ result, text })}
      extra={
        <div className={`flex flex-wrap gap-4 text-sm ${ui.text}`}>
          <label className="flex items-center gap-2">
            <input type="radio" checked={result === "agreement"} onChange={() => setResult("agreement")} />
            Hubo acuerdo
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={result === "no_agreement"} onChange={() => setResult("no_agreement")} />
            Sin acuerdo
          </label>
        </div>
      }
    />
  );
}

function ResolveAppealForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (v: { decision: "confirmed" | "revoked"; text: string }) => Promise<unknown>;
}) {
  const [decision, setDecision] = useState<"confirmed" | "revoked">("confirmed");

  return (
    <TextAction
      placeholder="Motivo de la decisión. Le llega a las dos partes."
      submitLabel={decision === "revoked" ? "Revocar sanción" : "Confirmar sanción"}
      minLength={5}
      pending={pending}
      onSubmit={(text) => onSubmit({ decision, text })}
      extra={
        <div className={`flex flex-wrap gap-4 text-sm ${ui.text}`}>
          <label className="flex items-center gap-2">
            <input type="radio" checked={decision === "confirmed"} onChange={() => setDecision("confirmed")} />
            Confirmar
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={decision === "revoked"} onChange={() => setDecision("revoked")} />
            Revocar
          </label>
        </div>
      }
    />
  );
}

function NoteForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (v: { text: string; internal: boolean }) => Promise<unknown>;
}) {
  const [internal, setInternal] = useState(true);

  return (
    <TextAction
      placeholder="La nota queda en la línea de tiempo."
      submitLabel="Agregar nota"
      pending={pending}
      onSubmit={(text) => onSubmit({ text, internal })}
      extra={
        <label className={`flex items-center gap-2 text-sm ${ui.text}`}>
          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
          Interna: solo la ven el comité, la administración y el consejo
        </label>
      }
    />
  );
}

function RespondentForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (body: { tower?: string; apartment?: string; description?: string }) => Promise<void>;
}) {
  const [tower, setTower] = useState("");
  const [apartment, setApartment] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      className="grid gap-3 sm:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          tower: tower || undefined,
          apartment: apartment || undefined,
          description: description || undefined,
        });
      }}
    >
      <input className={ui.input} placeholder="Torre" value={tower} onChange={(e) => setTower(e.target.value)} />
      <input className={ui.input} placeholder="Apartamento" value={apartment} onChange={(e) => setApartment(e.target.value)} />
      <input className={`${ui.input} sm:col-span-3`} placeholder="Descripción del convocado" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex justify-end sm:col-span-3">
        <button type="submit" className={button} disabled={pending || (!apartment.trim() && !description.trim())}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function SanctionForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (body: SanctionRequest) => Promise<unknown>;
}) {
  const [type, setType] = useState<"warning" | "fine">("warning");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deadline, setDeadline] = useState("");

  const isFine = type === "fine";
  const ready =
    title.trim().length >= 3 &&
    reason.trim().length >= 3 &&
    (!isFine || (Number(amount) > 0 && !!dueDate));

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          type,
          title,
          reason,
          ...(isFine
            ? { amount: Number(amount), dueDate }
            : { correctionDeadline: deadline || undefined }),
        });
      }}
    >
      <div className={`flex flex-wrap gap-4 text-sm sm:col-span-2 ${ui.text}`}>
        <label className="flex items-center gap-2">
          <input type="radio" checked={type === "warning"} onChange={() => setType("warning")} />
          Llamado de atención (sin cobro)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={type === "fine"} onChange={() => setType("fine")} />
          Multa
        </label>
      </div>
      <input className={`${ui.input} sm:col-span-2`} placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className={`${ui.input} min-h-[90px] sm:col-span-2`} placeholder="Motivo: qué norma se incumplió" value={reason} onChange={(e) => setReason(e.target.value)} />
      {isFine ? (
        <>
          <label className="block">
            <span className={ui.label}>Monto</span>
            <input type="number" min={1} className={ui.input} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="block">
            <span className={ui.label}>Fecha límite de pago</span>
            <input type="date" className={`${ui.input} dark:[color-scheme:dark]`} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </>
      ) : (
        <label className="block">
          <span className={ui.label}>Plazo para corregir (opcional)</span>
          <input type="date" className={`${ui.input} dark:[color-scheme:dark]`} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
      )}
      <div className="flex justify-end sm:col-span-2">
        <button type="submit" className={button} disabled={pending || !ready}>
          {pending ? "Imponiendo…" : isFine ? "Imponer multa" : "Enviar llamado de atención"}
        </button>
      </div>
    </form>
  );
}
