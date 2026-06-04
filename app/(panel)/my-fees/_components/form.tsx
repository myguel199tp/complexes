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

/* ================= TYPES ================= */

type FeeTypeForm = FormValues["feeType"];

/* ================= HELPERS ================= */

const feeTypeValues = [...Object.values(FeeType), "OTHER"] as const;

const parseFeeType = (value: string): FeeTypeForm => {
  if (feeTypeValues.includes(value as FeeTypeForm)) {
    return value as FeeTypeForm;
  }
  throw new Error("Tipo de cuota inválido");
};

/* ================= OPTIONS ================= */

const feeTypeOptions = [
  ...Object.values(FeeType).map((value) => ({
    label: value,
    value: value,
  })),
  { label: "Otro", value: "OTHER" },
];

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
  const feeType = watch("feeType") as FeeTypeForm;

  const selectedMonths = watch("specificMonths") || [];
  const allMonths = monthOptions.map((m) => Number(m.value));
  const allSelected = selectedMonths.length === 12;

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= CONFIG ================= */}

        <div className="space-y-4">
          <InputField
            type="date"
            helpText="Último pago"
            {...register("lastPaymentDate")}
            hasError={!!errors.lastPaymentDate}
            errorMessage={errors.lastPaymentDate?.message}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              type="number"
              placeholder="Presupuesto total"
              helpText="Presupuesto total"
              {...register("amount", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              hasError={!!errors.amount}
              errorMessage={errors.amount?.message}
            />

            <InputField
              type="text"
              placeholder="Moneda"
              {...register("currency")}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>

          <SelectField
            defaultOption="Frecuencia"
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
        </div>

        {/* ================= PAGO DIGITAL ================= */}

        <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" {...register("digitalPaymentEnabled")} />
            <Text size="sm">Pago digital habilitado</Text>
          </div>

          {digitalEnabled && (
            <InputField
              type="text"
              placeholder="URL de pago"
              {...register("digitalPaymentUrl")}
              hasError={!!errors.digitalPaymentUrl}
              errorMessage={errors.digitalPaymentUrl?.message}
            />
          )}
        </div>

        {/* ================= CUOTAS ================= */}

        <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
          <Text size="md">Generación automática</Text>

          <SelectField
            defaultOption="Tipo de cuota"
            options={feeTypeOptions}
            {...register("feeType")}
            onChange={(e) =>
              setValue(
                "feeType",
                parseFeeType(e.target.value), // ✅ SIN any
                { shouldValidate: true },
              )
            }
            hasError={!!errors.feeType}
            errorMessage={errors.feeType?.message}
          />

          {/* tipo personalizado */}
          {feeType === "OTHER" && (
            <InputField
              type="text"
              placeholder="Nombre personalizado"
              {...register("customFeeType")}
              hasError={!!errors.customFeeType}
              errorMessage={errors.customFeeType?.message}
            />
          )}

          {/* ================= MESES (SIEMPRE) ================= */}

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
        </div>

        <Button
          type="submit"
          size="full"
          colVariant="success"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </div>
  );
}
