"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "complexes-next-components";
import { modal as m } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import type {
  IsoWeekday,
  StaffMember,
  WorkSlot,
} from "../../services/staffService";
import { useStaffActions } from "./use-staff";
import {
  bogotaToIso,
  formatDateTime,
  formatTime,
  STAFF_ROLE_LABELS,
  STATUS_BADGE,
  staffStatus,
  todayInBogota,
  WEEKDAYS,
} from "./staff-format";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: StaffMember | null;
}

const TOLERANCE_OPTIONS = [0, 15, 30, 45, 60];

const button = {
  primary:
    "rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50",
  secondary:
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  danger:
    "rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50",
  link: "text-xs font-medium text-cyan-700 hover:underline disabled:opacity-50",
};

/**
 * Horario, turnos extra y retiro de un colaborador.
 *
 * El modal de la librería es siempre blanco: aquí solo colores para fondo
 * claro (`modal.*` del kit B2B), sin variantes `dark:`.
 */
export default function ModalStaff({ isOpen, onClose, member }: Props) {
  if (!member) return null;

  const status = staffStatus(member);
  const fullName = `${member.name} ${member.lastName}`.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Turnos de ${fullName}`}
      className="!w-[94%] md:!w-[680px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${m.text} font-medium`}>
            {STAFF_ROLE_LABELS[member.role] ?? member.role}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[status.tone]}`}
          >
            {status.label}
          </span>
          {member.active &&
            member.shift.hasSchedule &&
            !member.shift.onShift &&
            member.shift.nextShiftAt && (
              <span className={m.muted}>
                Próximo turno: {formatDateTime(member.shift.nextShiftAt)}
              </span>
            )}
        </div>

        {member.active && member.canHaveSchedule && (
          <>
            <ScheduleEditor member={member} />
            <ExtraShifts member={member} />
          </>
        )}

        {member.active && !member.canHaveSchedule && (
          <p className={`${m.box} ${m.text}`}>
            La administración no lleva horario: fuera de él nadie podría entrar
            a corregirlo.
          </p>
        )}

        <Retirement member={member} onDone={onClose} />
      </div>
    </Modal>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className={`text-sm font-semibold ${m.strong}`}>{title}</h3>
        {hint ? <p className={m.muted}>{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

type DraftSlot = { start: string; end: string };

function toDraft(slots: WorkSlot[] | undefined): Record<IsoWeekday, DraftSlot[]> {
  const draft = {} as Record<IsoWeekday, DraftSlot[]>;
  WEEKDAYS.forEach(({ day }) => {
    draft[day] = (slots ?? [])
      .filter((s) => s.day === day)
      .map((s) => ({ start: s.start, end: s.end }));
  });
  return draft;
}

function ScheduleEditor({ member }: { member: StaffMember }) {
  const { setSchedule, clearSchedule } = useStaffActions();

  const [draft, setDraft] = useState(() => toDraft(member.workSchedule?.slots));
  const [tolerance, setTolerance] = useState(
    member.workSchedule?.toleranceMinutes ?? 30,
  );

  // Al guardar llega el colaborador actualizado: el borrador se alinea.
  useEffect(() => {
    setDraft(toDraft(member.workSchedule?.slots));
    setTolerance(member.workSchedule?.toleranceMinutes ?? 30);
  }, [member.workSchedule]);

  const slots: WorkSlot[] = useMemo(
    () =>
      WEEKDAYS.flatMap(({ day }) =>
        draft[day].map((s) => ({ day, start: s.start, end: s.end })),
      ),
    [draft],
  );

  const update = (day: IsoWeekday, slotsOfDay: DraftSlot[]) =>
    setDraft((d) => ({ ...d, [day]: slotsOfDay }));

  const copyMondayToWeekdays = () =>
    setDraft((d) => ({
      ...d,
      2: d[1].map((s) => ({ ...s })),
      3: d[1].map((s) => ({ ...s })),
      4: d[1].map((s) => ({ ...s })),
      5: d[1].map((s) => ({ ...s })),
    }));

  const busy = setSchedule.isLoading || clearSchedule.isLoading;

  return (
    <Section
      title="Horario semanal"
      hint={
        <>
          Fuera de su horario no podrá usar la plataforma en este conjunto. Sin
          horario no tiene restricción. Si la hora de fin es menor que la de
          inicio, el turno termina al día siguiente (18:00–06:00).
        </>
      }
    >
      <div className={`${m.box} space-y-2`}>
        {WEEKDAYS.map(({ day, long }) => (
          <div
            key={day}
            className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 last:border-0 last:pb-0"
          >
            <span className={`w-24 text-sm ${m.strong}`}>{long}</span>

            {draft[day].length === 0 ? (
              <span className={m.muted}>Descansa</span>
            ) : (
              <div className="flex flex-col gap-1">
                {draft[day].map((slot, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="time"
                      className={`${m.input} !w-28 !py-1`}
                      value={slot.start}
                      onChange={(e) =>
                        update(
                          day,
                          draft[day].map((s, j) =>
                            j === i ? { ...s, start: e.target.value } : s,
                          ),
                        )
                      }
                    />
                    <span className={m.muted}>a</span>
                    <input
                      type="time"
                      className={`${m.input} !w-28 !py-1`}
                      value={slot.end}
                      onChange={(e) =>
                        update(
                          day,
                          draft[day].map((s, j) =>
                            j === i ? { ...s, end: e.target.value } : s,
                          ),
                        )
                      }
                    />
                    {slot.end && slot.start && slot.end <= slot.start && (
                      <span className="text-[11px] text-amber-700">
                        +1 día
                      </span>
                    )}
                    <button
                      type="button"
                      className="px-1 text-sm text-slate-400 hover:text-red-600"
                      aria-label="Quitar franja"
                      onClick={() =>
                        update(
                          day,
                          draft[day].filter((_, j) => j !== i),
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className={`${button.link} ml-auto`}
              onClick={() =>
                update(day, [...draft[day], { start: "06:00", end: "18:00" }])
              }
            >
              + Franja
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className={`${m.text} flex items-center gap-2`}>
          Margen para el relevo
          <select
            className={`${m.input} !w-auto !py-1`}
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
          >
            {TOLERANCE_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes === 0 ? "Sin margen" : `${minutes} min`}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={button.link}
          onClick={copyMondayToWeekdays}
          disabled={draft[1].length === 0}
        >
          Copiar el lunes a martes–viernes
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={button.primary}
          disabled={busy || slots.length === 0}
          onClick={() =>
            setSchedule.mutate({
              relationId: member.relationId,
              slots,
              toleranceMinutes: tolerance,
            })
          }
        >
          Guardar horario
        </button>
        {member.workSchedule && (
          <button
            type="button"
            className={button.secondary}
            disabled={busy}
            onClick={() => clearSchedule.mutate(member.relationId)}
          >
            Quitar horario
          </button>
        )}
      </div>
    </Section>
  );
}

function ExtraShifts({ member }: { member: StaffMember }) {
  const { addExtraShift, removeExtraShift } = useStaffActions();

  const [date, setDate] = useState(todayInBogota);
  const [from, setFrom] = useState("06:00");
  const [until, setUntil] = useState("18:00");
  const [note, setNote] = useState("");

  const submit = () => {
    const fromIso = bogotaToIso(date, from);
    let untilIso = bogotaToIso(date, until);

    // 18:00 a 06:00 es la noche: termina al día siguiente.
    if (until <= from) {
      untilIso = new Date(
        new Date(untilIso).getTime() + 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    addExtraShift.mutate(
      {
        relationId: member.relationId,
        from: fromIso,
        until: untilIso,
        note,
      },
      { onSuccess: () => setNote("") },
    );
  };

  return (
    <Section
      title="Turnos extra"
      hint="Para un reemplazo o una hora extra por fuera del horario. Máximo 24 horas cada uno."
    >
      {member.extraShifts.length > 0 && (
        <ul className="space-y-1">
          {member.extraShifts.map((shift) => (
            <li
              key={shift.id}
              className={`${m.box} flex flex-wrap items-center justify-between gap-2 !py-2`}
            >
              <span className={m.text}>
                {formatDateTime(shift.from)} a {formatTime(shift.until)}
                {shift.note ? ` · ${shift.note}` : ""}
              </span>
              <button
                type="button"
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                disabled={removeExtraShift.isLoading}
                onClick={() =>
                  removeExtraShift.mutate({
                    relationId: member.relationId,
                    extraShiftId: shift.id,
                  })
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label>
          <span className={m.label}>Día</span>
          <input
            type="date"
            className={m.input}
            value={date}
            min={todayInBogota()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          <span className={m.label}>Desde</span>
          <input
            type="time"
            className={m.input}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          <span className={m.label}>
            Hasta{until <= from ? " (día siguiente)" : ""}
          </span>
          <input
            type="time"
            className={m.input}
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
        </label>
        <label className="col-span-2 sm:col-span-1">
          <span className={m.label}>Nota</span>
          <input
            className={m.input}
            value={note}
            maxLength={200}
            placeholder="Cubre a…"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className={button.secondary}
        disabled={addExtraShift.isLoading || !date || !from || !until}
        onClick={submit}
      >
        Agregar turno extra
      </button>
    </Section>
  );
}

function Retirement({
  member,
  onDone,
}: {
  member: StaffMember;
  onDone: () => void;
}) {
  const { retire, reactivate } = useStaffActions();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  if (!member.active) {
    return (
      <Section title="Retirado del conjunto">
        <div className={`${m.box} space-y-1`}>
          {member.deactivatedAt && (
            <p className={m.text}>
              Desde el {formatDateTime(member.deactivatedAt)}.
            </p>
          )}
          {member.deactivatedReason && (
            <p className={m.text}>Motivo: {member.deactivatedReason}</p>
          )}
          <p className={m.muted}>
            Si vuelve a trabajar aquí, reactívalo: conserva su horario.
          </p>
        </div>
        <button
          type="button"
          className={button.primary}
          disabled={reactivate.isLoading}
          onClick={() =>
            reactivate.mutate(member.relationId, { onSuccess: onDone })
          }
        >
          Reactivar
        </button>
      </Section>
    );
  }

  return (
    <Section
      title="Ya no trabaja aquí"
      hint="Pierde el acceso a este conjunto de inmediato. No se borra: queda el registro de que trabajó aquí y se puede reactivar."
    >
      {!confirming ? (
        <button
          type="button"
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          onClick={() => setConfirming(true)}
        >
          Retirar del conjunto
        </button>
      ) : (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <label className="block">
            <span className={m.label}>Motivo (opcional)</span>
            <textarea
              className={m.input}
              rows={2}
              maxLength={300}
              value={reason}
              placeholder="Renunció, terminó el contrato…"
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={button.danger}
              disabled={retire.isLoading}
              onClick={() =>
                retire.mutate(
                  { relationId: member.relationId, reason },
                  { onSuccess: onDone },
                )
              }
            >
              Confirmar retiro
            </button>
            <button
              type="button"
              className={button.secondary}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
