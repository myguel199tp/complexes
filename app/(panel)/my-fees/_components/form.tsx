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

/**
 * ✅ IMPORTANTE:
 * usamos Object.values para trabajar con los VALUES reales del enum
 */
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
  const feeType = watch("feeType") as FeeType;

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= CONFIGURACIÓN DE PAGO ================= */}
        <div className="space-y-4">
          <Text size="md">Configuración de pago</Text>

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
              placeholder="Monto"
              helpText="Monto"
              {...register("amount", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? undefined
                    : Number(v),
              })}
              hasError={!!errors.amount}
              errorMessage={errors.amount?.message}
            />

            <InputField
              type="text"
              placeholder="Moneda (Ej: COP)"
              helpText="Moneda"
              {...register("currency")}
              hasError={!!errors.currency}
              errorMessage={errors.currency?.message}
            />
          </div>

          <InputField
            type="text"
            placeholder="Ej: Banco, Portería, Online"
            helpText="Lugares de pago"
            {...register("paymentPlaces", {
              setValueAs: (value) =>
                String(value || "")
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
            })}
            hasError={!!errors.paymentPlaces}
            errorMessage={errors.paymentPlaces?.message}
          />

          <SelectField
            defaultOption="Frecuencia recomendada"
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
              helpText="URL de pago digital"
              {...register("digitalPaymentUrl")}
              hasError={!!errors.digitalPaymentUrl}
              errorMessage={errors.digitalPaymentUrl?.message}
            />
          )}
        </div>

        <InputField
          type="number"
          placeholder="Ej: 5"
          helpText="Días antes para mostrar mensaje"
          {...register("showMessageDaysBefore", {
            setValueAs: (v) =>
              v === "" || v === null || v === undefined ? undefined : Number(v),
          })}
          hasError={!!errors.showMessageDaysBefore}
          errorMessage={errors.showMessageDaysBefore?.message}
        />

        {/* ================= CONFIGURACIÓN AUTOMÁTICA ================= */}
        <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
          <Text size="md">Generación automática de cuotas</Text>

          <SelectField
            defaultOption="Tipo de cuota"
            options={feeTypeOptions}
            {...register("feeType")}
            onChange={(e) =>
              setValue("feeType", e.target.value as FeeType, {
                shouldValidate: true,
              })
            }
            hasError={!!errors.feeType}
            errorMessage={errors.feeType?.message}
          />

          {/* 👇 SOLO si NO es extraordinaria */}
          {feeType !== FeeType.CUOTA_EXTRAORDINARIAS && (
            <InputField
              type="number"
              placeholder="Ej: 6"
              helpText="Cantidad de meses a generar"
              {...register("monthsToGenerate", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? undefined
                    : Number(v),
              })}
              hasError={!!errors.monthsToGenerate}
              errorMessage={errors.monthsToGenerate?.message}
            />
          )}

          {/* 👇 SOLO si es extraordinaria */}
          {feeType === FeeType.CUOTA_EXTRAORDINARIAS && (
            <Controller
              name="monthsToGenerate"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  id="monthsToGenerate"
                  searchable
                  defaultOption="Selecciona meses"
                  helpText="Meses a generar"
                  options={monthOptions}
                  onChange={(values) => {
                    field.onChange(values);
                  }}
                  hasError={!!errors.monthsToGenerate}
                  errorMessage={errors.monthsToGenerate?.message}
                />
              )}
            />
          )}
        </div>

        {/* ================= SUBMIT ================= */}
        <Button
          type="submit"
          size="full"
          colVariant="warning"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </Button>
      </form>
    </div>
  );
}
