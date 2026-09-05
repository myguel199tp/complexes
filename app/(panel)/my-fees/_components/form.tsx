"use client";
import React from "react";
import {
  Button,
  InputField,
  Text,
  SelectField,
  MultiSelect,
} from "complexes-next-components";

import { MONTHS_BY_SCHEDULE, useFormProvider } from "./use-form";
import { FeeType } from "../services/admin-fee-payment";
import { Controller } from "react-hook-form";
import { FormValues } from "./formValues";
import { useHasBankAccount } from "./useHasBankAccount";
import { ConjuntoBankAccount } from "../services/bankUnitService";
import DateField from "@/app/components/ui/date-field/DateField";

/* ================= OPTIONS ================= */

const feeTypeOptions = Object.values(FeeType).map((value) => ({
  label: value,
  value: value,
}));

const frequencyOptions = [
  { label: "Mensual", value: "MONTHLY" },
  { label: "Trimestral", value: "QUARTERLY" },
  { label: "Semestral", value: "BIANNUAL" },
  { label: "Anual", value: "YEARLY" },
];

const monthOptions = [
  { label: "Enero", value: "1" },
  { label: "Febrero", value: "2" },
  { label: "Marzo", value: "3" },
  { label: "Abril", value: "4" },
  { label: "Mayo", value: "5" },
  { label: "Junio", value: "6" },
  { label: "Julio", value: "7" },
  { label: "Agosto", value: "8" },
  { label: "Septiembre", value: "9" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

const SCHEDULE_PLURAL: Record<string, string> = {
  MONTHLY: "mensuales",
  QUARTERLY: "trimestrales",
  BIANNUAL: "semestrales",
  YEARLY: "anuales",
};

/**
 * Reproduce el avance de fechas de la generación (`dueDate.setMonth(mes + i *
 * intervalo)`) para mostrar el calendario real antes de guardar.
 *
 * El campo se llamaba "Último pago", pero es el vencimiento de la PRIMERA
 * cuota: de ahí salen el día del mes que se repite en todas y el mes de
 * arranque. Sin ver el resultado no había forma de notar la diferencia hasta
 * que la cartera ya estaba generada.
 */
function buildScheduleSummary(
  firstDueDate?: string,
  schedule?: string,
  count?: number,
) {
  if (!firstDueDate || !count || count < 1) return null;

  const [year, month, day] = firstDueDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const step = MONTHS_BY_SCHEDULE[schedule ?? ""] ?? 1;

  const first = new Date(year, month - 1, day);
  const last = new Date(year, month - 1, day);
  last.setMonth(last.getMonth() + (count - 1) * step);

  const fmt = (date: Date) => date.toLocaleDateString("es-CO");
  const plural = SCHEDULE_PLURAL[schedule ?? ""] ?? "";

  return {
    text:
      count === 1
        ? `Se generará 1 cuota con vencimiento el ${fmt(first)} para cada unidad.`
        : `Se generarán ${count} cuotas ${plural} para cada unidad, del ${fmt(
            first,
          )} al ${fmt(last)}.`,
    /*
      Los meses de 30 días no tienen 31: la fecha se desborda al mes siguiente
      y corre el resto del calendario. Febrero hace lo mismo con 29 y 30.
    */
    dayDrifts: count > 1 && day > 28,
    day,
  };
}

/* ================= COMPONENT ================= */

export default function Form() {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    watch,
    setValue,
    control,
  } = useFormProvider();

  const digitalEnabled = watch("digitalPaymentEnabled");
  const feeType = watch("feeType");
  const isParking = feeType === FeeType.PAGO_DE_PARQUEADERO;
  const isExtraordinary = feeType === FeeType.CUOTA_EXTRAORDINARIAS;

  const selectedMonths = watch("specificMonths") || [];
  const allMonths = monthOptions.map((m) => Number(m.value));
  const allSelected = selectedMonths.length === 12;

  const schedulePreview = buildScheduleSummary(
    watch("lastPaymentDate"),
    watch("recommendedSchedule"),
    watch("monthsToGenerate"),
  );

  const { data: bankAccounts = [] } = useHasBankAccount();

  const bankAccountOptions = (bankAccounts as ConjuntoBankAccount[]).map(
    (account) => ({
      label: `${account.bankName} · ${account.accountNumber}${
        account.isPrimary ? " (principal)" : ""
      }`,
      value: account.id,
    }),
  );

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= CUOTAS ================= */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
          <Text
            size="xs"
            font="bold"
            className="text-gray-400 uppercase tracking-wide mb-1"
          >
            Generación automática
          </Text>

          <SelectField
            defaultOption="Tipo de cuota"
            helpText="Tipo de cuota"
            sizeHelp="xs"
            inputSize="md"
            rounded="lg"
            options={feeTypeOptions}
            {...register("feeType")}
            onChange={(e) =>
              setValue("feeType", e.target.value as FormValues["feeType"], {
                shouldValidate: true,
              })
            }
            hasError={!!errors.feeType}
            errorMessage={errors.feeType?.message}
          />

          {/* ================= PARQUEADERO (POR HORA) ================= */}

          {isParking && (
            <div className="space-y-1">
              <InputField
                regexType="number"
                type="number"
                placeholder="Valor por hora (ej: 2000)"
                helpText="Valor por hora del parqueadero"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                {...register("parkingRatePerHour", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                hasError={!!errors.parkingRatePerHour}
                errorMessage={errors.parkingRatePerHour?.message}
              />
              <Text size="xs" className="text-gray-400">
                El parqueadero se cobra por hora. Este valor se usará
                automáticamente en la citofonía por cada visita.
              </Text>
            </div>
          )}

          {/* ================= MESES ================= */}

          {/*
            Los meses explícitos solo aplican a las cuotas extraordinarias: para
            el resto, `use-form` los limpia al cambiar de tipo, así que el
            selector se mostraba pero no producía nada.
          */}
          {isExtraordinary && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValue("specificMonths", allMonths, {
                        shouldValidate: true,
                      });
                    } else {
                      setValue("specificMonths", [], {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
                <Text size="sm">Seleccionar todos los meses</Text>
              </div>

              <Controller
                name="specificMonths"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    id="specificMonths"
                    searchable
                    defaultOption="Selecciona meses"
                    options={monthOptions}
                    value={field.value?.map(String) || []}
                    onChange={(values) => {
                      field.onChange(values.map(Number));
                    }}
                    hasError={!!errors.specificMonths}
                    errorMessage={errors.specificMonths?.message}
                  />
                )}
              />
            </>
          )}
        </div>

        {/* ================= CONFIG ================= */}

        <div className="space-y-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <Text
            size="xs"
            font="bold"
            className="text-gray-400 uppercase tracking-wide mb-1"
          >
            Configuración de cuotas
          </Text>
          <div className="space-y-1">
            <Controller
              name="lastPaymentDate"
              control={control}
              render={({ field }) => (
                <DateField
                  label="Vencimiento de la primera cuota"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  errorMessage={errors.lastPaymentDate?.message}
                />
              )}
            />
            <Text size="xs" className="text-gray-400">
              El día que elijas se repite en todas las cuotas: 30/09/2026
              significa que vencen el 30 de cada mes.
            </Text>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {!isParking && (
              <div className="space-y-1">
                <InputField
                  regexType="number"
                  type="number"
                  placeholder="Presupuesto por cuota"
                  helpText="Presupuesto por cuota"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  {...register("amount", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  hasError={!!errors.amount}
                  errorMessage={errors.amount?.message}
                />
                <Text size="xs" className="text-gray-400">
                  Es el presupuesto de cada cobro, no el del año: se reparte
                  entre las unidades según su coeficiente de copropiedad.
                </Text>
              </div>
            )}

            <InputField
              regexType="safeChars"
              type="text"
              placeholder="Moneda"
              helpText="Moneda"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              {...register("currency")}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>

          {!isParking && (
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField
                defaultOption="Frecuencia"
                helpText="Cada cuánto se cobra"
                sizeHelp="xs"
                inputSize="md"
                rounded="lg"
                options={frequencyOptions}
                {...register("recommendedSchedule")}
                onChange={(e) =>
                  setValue("recommendedSchedule", e.target.value, {
                    shouldValidate: true,
                  })
                }
                hasError={!!errors.recommendedSchedule}
                errorMessage={errors.recommendedSchedule?.message}
              />

              {/*
                Este campo estaba en el schema pero no tenía input, así que
                siempre llegaba vacío: la generación caía al default de 12 para
                la cuota de administración y fallaba para los demás tipos.
                Las extraordinarias no lo usan porque van por meses explícitos.
              */}
              {!isExtraordinary && (
                <InputField
                  regexType="number"
                  type="number"
                  placeholder="Ej: 12"
                  helpText="Cuántas cuotas generar (12 = un año de cuotas mensuales)"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  {...register("monthsToGenerate", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  hasError={!!errors.monthsToGenerate}
                  errorMessage={errors.monthsToGenerate?.message}
                />
              )}
            </div>
          )}

          {!isParking && !isExtraordinary && schedulePreview && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-1">
              <Text size="sm" className="text-gray-700">
                {schedulePreview.text}
              </Text>
              {schedulePreview.dayDrifts && (
                <Text size="xs" className="text-amber-600">
                  Ojo: no todos los meses tienen día {schedulePreview.day}. En
                  los que no, la cuota se corre al mes siguiente y desordena el
                  calendario. Usa un día del 1 al 28.
                </Text>
              )}
            </div>
          )}

          {!isParking && (
            <div className="grid md:grid-cols-2 gap-4">
              {/*
                Estos dos campos existían en el modelo pero no en el formulario,
                así que ningún conjunto podía configurarlos: no se avisaba nunca
                antes de un vencimiento y la mora estaba fija en el código.
              */}
              <InputField
                regexType="number"
                type="number"
                placeholder="Días de aviso"
                helpText="Avisar al residente X días antes del vencimiento"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                {...register("showMessageDaysBefore", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                hasError={!!errors.showMessageDaysBefore}
                errorMessage={errors.showMessageDaysBefore?.message}
              />

              <InputField
                regexType="number"
                type="number"
                step="0.01"
                placeholder="Interés de mora (%)"
                helpText="Interés de mora mensual (%). Vacío = no se cobra mora"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                {...register("moraRatePercent", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                hasError={!!errors.moraRatePercent}
                errorMessage={errors.moraRatePercent?.message}
              />

              {/*
                Solo marca la unidad como candidata en la cartera: el traslado a
                cobro jurídico sigue siendo manual. Cada reglamento fija su
                propio corte, así que dejarlo vacío es válido y significa que el
                conjunto no quiere sugerencias.
              */}
              <InputField
                regexType="number"
                type="number"
                placeholder="Días para sugerir cobro jurídico"
                helpText="Días de mora para sugerir cobro jurídico. Vacío = no se sugiere"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                {...register("legalThresholdDays", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                hasError={!!errors.legalThresholdDays}
                errorMessage={errors.legalThresholdDays?.message}
              />
            </div>
          )}
        </div>

        {/* ================= DÓNDE PAGAR ================= */}

        {/*
          El backend ya recibía `bankAccountIds`, pero el formulario no tenía
          selector y nunca los enviaba: la configuración quedaba sin cuentas y
          el residente veía cuánto debía sin saber a dónde consignarlo.
        */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
          <Text
            size="xs"
            font="bold"
            className="text-gray-400 uppercase tracking-wide mb-1"
          >
            Dónde pagar
          </Text>

          {bankAccounts.length === 0 ? (
            <Text size="xs" className="text-gray-400">
              No hay cuentas bancarias verificadas en el conjunto. Regístralas
              primero para que el residente sepa dónde consignar.
            </Text>
          ) : (
            <Controller
              name="bankAccountIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  id="bankAccountIds"
                  searchable
                  defaultOption="Selecciona las cuentas"
                  options={bankAccountOptions}
                  value={field.value ?? []}
                  onChange={(values) => field.onChange(values)}
                  hasError={!!errors.bankAccountIds}
                  errorMessage={errors.bankAccountIds?.message}
                />
              )}
            />
          )}
        </div>

        {/* ================= PAGO DIGITAL ================= */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" {...register("digitalPaymentEnabled")} />
            <Text size="sm">Pago digital habilitado</Text>
          </div>

          {digitalEnabled && (
            <InputField
              type="text"
              placeholder="URL de pago"
              helpText="URL de pago"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              {...register("digitalPaymentUrl")}
              hasError={!!errors.digitalPaymentUrl}
              errorMessage={errors.digitalPaymentUrl?.message}
            />
          )}
        </div>

        <Button
          type="submit"
          size="full"
          colVariant="success"
          rounded="md"
          disabled={isSubmitting}
          className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </div>
  );
}
