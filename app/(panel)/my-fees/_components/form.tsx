"use client";
import React from "react";
import {
  Button,
  InputField,
  Text,
  SelectField,
  MultiSelect,
} from "complexes-next-components";

import { useFormProvider } from "./use-form";
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
          <Controller
            name="lastPaymentDate"
            control={control}
            render={({ field }) => (
              <DateField
                label="Último pago"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                errorMessage={errors.lastPaymentDate?.message}
              />
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            {!isParking && (
              <InputField
                type="number"
                placeholder="Presupuesto total"
                helpText="Presupuesto total"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                {...register("amount", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                hasError={!!errors.amount}
                errorMessage={errors.amount?.message}
              />
            )}

            <InputField
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
                  type="number"
                  placeholder="Ej: 12"
                  helpText="Cuántas cuotas generar"
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

          {!isParking && (
            <div className="grid md:grid-cols-2 gap-4">
              {/*
                Estos dos campos existían en el modelo pero no en el formulario,
                así que ningún conjunto podía configurarlos: no se avisaba nunca
                antes de un vencimiento y la mora estaba fija en el código.
              */}
              <InputField
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
