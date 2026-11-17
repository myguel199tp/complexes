"use client";

import React from "react";
import { Text } from "complexes-next-components";
import { MdEdit } from "react-icons/md";
import { ImSpinner9 } from "react-icons/im";
import type { StaffMember } from "../../services/staffService";
import {
  describeEmployment,
  formatDateTime,
  formatTime,
  STAFF_ROLE_LABELS,
  STATUS_BADGE,
  staffStatus,
  WEEKDAYS,
} from "./staff-format";

interface Props {
  /** Rol de la relación: el cargo se conoce aunque `/staff` no responda. */
  role: string;
  member: StaffMember | null;
  loading: boolean;
  failed: boolean;
  /** Abre el editor de contratación y horario. Sin él no hay botón. */
  onEdit?: () => void;
}

const box = "p-5 bg-gray-50 rounded-lg border border-gray-200";

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <Text size="xs" className="text-gray-500">
        {label}
      </Text>
      <div className="text-sm font-medium text-slate-800">{children}</div>
    </div>
  );
}

/**
 * Lo laboral de un colaborador: cargo, contratación, si está en turno, su
 * horario semanal, turnos extra y retiro. Es de lectura; se edita en
 * `ModalStaff`, el mismo de la columna "Horario" de colaboradores.
 */
export default function StaffProfile({
  role,
  member,
  loading,
  failed,
  onEdit,
}: Props) {
  const roleLabel = STAFF_ROLE_LABELS[role] ?? role;

  if (loading) {
    return (
      <div className={`${box} flex items-center gap-2 text-sm text-slate-500`}>
        <ImSpinner9 className="animate-spin text-cyan-800" size={16} />
        Cargando la información laboral…
      </div>
    );
  }

  if (!member) {
    return (
      <div className={`${box} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
        <Field label="Cargo">{roleLabel}</Field>
        <Field label="Contratación y horario" wide>
          <span className="font-normal text-slate-500">
            {failed
              ? "No se pudo cargar la información laboral."
              : "Sin información laboral registrada."}
          </span>
        </Field>
      </div>
    );
  }

  const status = staffStatus(member);
  const employment = describeEmployment(member);
  const slots = member.workSchedule?.slots ?? [];
  const tolerance = member.workSchedule?.toleranceMinutes ?? 0;

  return (
    <div className={`${box} space-y-5`}>
      {onEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 rounded-md border border-cyan-600 px-3 py-1 text-sm text-cyan-700 transition-colors hover:bg-cyan-50"
          >
            <MdEdit /> Editar contratación y horario
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cargo">{roleLabel}</Field>

        <Field label="Estado">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[status.tone]}`}
          >
            {status.label}
          </span>
          {member.active &&
            member.shift.hasSchedule &&
            !member.shift.onShift &&
            member.shift.nextShiftAt && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                Próximo turno: {formatDateTime(member.shift.nextShiftAt)}
              </span>
            )}
        </Field>

        <Field label="Contratación" wide>
          {employment.missing ? (
            <span className="font-normal text-amber-700">
              Sin dato: aún no se ha dicho si tiene contrato directo con el
              conjunto o si viene de una empresa.
            </span>
          ) : member.employment.type === "direct" ? (
            "Directo · contrato con el conjunto"
          ) : (
            <>
              {employment.label}
              <span className="ml-2 text-xs font-normal text-slate-500">
                Empresa externa
              </span>
            </>
          )}
        </Field>
      </div>

      {member.active && !member.canHaveSchedule && (
        <p className="text-sm text-slate-600">
          La administración no lleva horario: fuera de él nadie podría entrar a
          corregirlo.
        </p>
      )}

      {member.active && member.canHaveSchedule && (
        <section className="space-y-2">
          <Text size="xs" className="text-gray-500">
            Horario semanal
          </Text>

          {slots.length === 0 ? (
            <p className="text-sm text-slate-600">
              Sin horario: puede usar la plataforma a cualquier hora.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
                {WEEKDAYS.map(({ day, long }) => {
                  const ofDay = slots.filter((s) => s.day === day);

                  return (
                    <li
                      key={day}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="w-24 font-medium text-slate-700">
                        {long}
                      </span>
                      <span
                        className={
                          ofDay.length ? "text-slate-800" : "text-slate-400"
                        }
                      >
                        {ofDay.length
                          ? ofDay
                              .map(
                                (s) =>
                                  `${s.start}–${s.end}${
                                    s.end <= s.start ? " (+1 día)" : ""
                                  }`,
                              )
                              .join(", ")
                          : "Descansa"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-slate-500">
                Margen para el relevo:{" "}
                {tolerance === 0 ? "sin margen" : `${tolerance} min`}
              </p>
            </>
          )}
        </section>
      )}

      {member.active && member.extraShifts.length > 0 && (
        <section className="space-y-2">
          <Text size="xs" className="text-gray-500">
            Turnos extra
          </Text>
          <ul className="space-y-1">
            {member.extraShifts.map((shift) => (
              <li
                key={shift.id}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {formatDateTime(shift.from)} a {formatTime(shift.until)}
                {shift.note ? ` · ${shift.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!member.active && (
        <section className="space-y-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <p className="font-medium">Ya no trabaja en el conjunto</p>
          {member.deactivatedAt && (
            <p>Retirado desde el {formatDateTime(member.deactivatedAt)}.</p>
          )}
          {member.deactivatedReason && (
            <p>Motivo: {member.deactivatedReason}</p>
          )}
        </section>
      )}
    </div>
  );
}
