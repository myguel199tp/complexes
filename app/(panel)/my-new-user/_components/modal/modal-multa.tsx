"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Modal,
} from "complexes-next-components";

import { Controller } from "react-hook-form";
import { useFormResidentFine } from "./use-multa-form";
import { useWarningForm } from "./use-warning-form";
import {
  useCancelWarningMutation,
  useUnitHistoryQuery,
} from "./use-warnings";
import UnitDisciplineHistory from "./unit-discipline-history";
import DateField from "@/app/components/ui/date-field/DateField";

import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { InputField, SelectField, TextAreaField } from "@/app/components/ui/form";

interface Props {
  isOpen: boolean;

  onClose: () => void;

  selectedUser?: EnsembleResponse | null;

  title?: string;
}

type Mode = "warning" | "fine";

/**
 * Llamado de atención o multa para una unidad.
 *
 * El llamado es el paso recomendado antes de multar, pero no es obligatorio:
 * si la unidad no tiene llamados vigentes el modal abre en "Llamado de
 * atención" y, en la pestaña de multa, lo advierte sin bloquear.
 */
export default function ModalMulta({
  isOpen,
  onClose,
  selectedUser,
  title = "Llamado de atención o multa",
}: Props) {
  const relationId = selectedUser?.id;

  const fineForm = useFormResidentFine(onClose);
  const warningForm = useWarningForm(onClose);

  const history = useUnitHistoryQuery(relationId, isOpen);
  const cancelWarning = useCancelWarningMutation();

  // null = todavía no se eligió: decide el historial.
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    if (relationId) {
      fineForm.setValue("relationId", relationId);
      warningForm.setValue("relationId", relationId);
    }
    setMode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationId, isOpen]);

  const activeWarnings = useMemo(
    () => (history.data?.warnings ?? []).filter((w) => w.status === "notified"),
    [history.data],
  );

  const hasPriorWarning = activeWarnings.length > 0;
  const currentMode: Mode = mode ?? (hasPriorWarning ? "fine" : "warning");

  const warningOptions = activeWarnings.map((w) => ({
    value: w.id,
    label: `${w.title} — ${new Date(w.createdAt).toLocaleDateString("es-CO", {
      timeZone: "America/Bogota",
    })}`,
  }));

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-800"
    }`;

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      onClose={onClose}
      title={title}
      className="!w-[94%] md:!w-[1200px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      <div className="mt-4 space-y-4">
        <UnitDisciplineHistory
          history={history.data}
          isLoading={history.isLoading}
          cancellingId={cancelWarning.isPending ? cancelWarning.variables : null}
          onCancelWarning={(id) => cancelWarning.mutate(id)}
        />

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={tabClass(currentMode === "warning")}
            onClick={() => setMode("warning")}
          >
            Llamado de atención
            {!hasPriorWarning && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                Recomendado
              </span>
            )}
          </button>
          <button
            type="button"
            className={tabClass(currentMode === "fine")}
            onClick={() => setMode("fine")}
          >
            Multa
          </button>
        </div>

        {currentMode === "warning" ? (
          <form onSubmit={warningForm.handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-600">
              El llamado de atención no genera cobro. Le llega al residente por
              correo con el motivo y, si lo pones, el plazo para corregir. Si la
              conducta sigue, puedes multar desde la pestaña &quot;Multa&quot;.
            </p>

            <InputField
              regexType="safeChars"
              type="text"
              placeholder="Título del llamado"
              helpText="Título"
              {...warningForm.register("title")}
              inputSize="md"
              rounded="md"
              hasError={!!warningForm.formState.errors.title}
              errorMessage={warningForm.formState.errors.title?.message}
            />

            <TextAreaField
              placeholder="Qué pasó y qué norma se incumplió"
              helpText="Motivo"
              {...warningForm.register("reason")}
              hasError={!!warningForm.formState.errors.reason}
              errorMessage={warningForm.formState.errors.reason?.message}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="incidentDate"
                control={warningForm.control}
                render={({ field }) => (
                  <DateField
                    label="Fecha del incidente"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />

              <Controller
                name="correctionDeadline"
                control={warningForm.control}
                render={({ field }) => (
                  <DateField
                    label="Plazo para corregir (opcional)"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
            </div>

            <InputField
              type="text"
              placeholder="URL evidencia"
              helpText="Evidencia"
              {...warningForm.register("evidenceUrl")}
              inputSize="md"
              rounded="md"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" colVariant="default" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                colVariant="warning"
                disabled={warningForm.isSubmitting}
              >
                {warningForm.isSubmitting
                  ? "Enviando..."
                  : "Enviar llamado de atención"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={fineForm.handleSubmit} className="space-y-4">
            {!history.isLoading && !hasPriorWarning && (
              <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-amber-900">
                  {history.data?.recommendation ??
                    "Esta unidad no tiene llamados de atención. Lo recomendado es enviar uno primero; si lo prefieres, puedes poner la multa directamente."}
                </p>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
                  onClick={() => setMode("warning")}
                >
                  Enviar llamado primero
                </button>
              </div>
            )}

            {hasPriorWarning && (
              <Controller
                name="warningId"
                control={fineForm.control}
                render={({ field }) => (
                  <SelectField
                    options={warningOptions}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    defaultOption="Sin llamado previo"
                    helpText="Llamado de atención que antecede esta multa (opcional)"
                    inputSize="md"
                    rounded="md"
                  />
                )}
              />
            )}

            <InputField
              regexType="safeChars"
              type="text"
              placeholder="Título de la multa"
              helpText="Título"
              {...fineForm.register("title")}
              inputSize="md"
              rounded="md"
              hasError={!!fineForm.errors.title}
              errorMessage={fineForm.errors.title?.message}
            />

            <TextAreaField
              placeholder="Razón de la multa"
              helpText="Razón"
              {...fineForm.register("reason")}
              hasError={!!fineForm.errors.reason}
              errorMessage={fineForm.errors.reason?.message}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                regexType="number"
                type="number"
                placeholder="Monto"
                helpText="Monto"
                {...fineForm.register("amount")}
                inputSize="md"
                rounded="md"
                hasError={!!fineForm.errors.amount}
                errorMessage={fineForm.errors.amount?.message}
              />

              <Controller
                name="dueDate"
                control={fineForm.control}
                render={({ field }) => (
                  <DateField
                    label="Fecha límite de pago"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    errorMessage={fineForm.errors.dueDate?.message}
                  />
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="incidentDate"
                control={fineForm.control}
                render={({ field }) => (
                  <DateField
                    label="Fecha del incidente"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    errorMessage={fineForm.errors.incidentDate?.message}
                  />
                )}
              />

              <InputField
                type="text"
                placeholder="URL evidencia"
                helpText="Evidencia"
                {...fineForm.register("evidenceUrl")}
                inputSize="md"
                rounded="md"
                hasError={!!fineForm.errors.evidenceUrl}
                errorMessage={fineForm.errors.evidenceUrl?.message}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" colVariant="default" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                colVariant="success"
                disabled={fineForm.isSubmitting}
              >
                {fineForm.isSubmitting ? "Creando multa..." : "Crear multa"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
