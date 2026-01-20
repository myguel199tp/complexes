"use client";

import React from "react";
import {
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import { Controller } from "react-hook-form";
import { useFormMaintenance } from "./use-form-maintenance";
import { useProviderQuery } from "./use-provider-query";
import { useAreaQuery } from "./use-area-query";
import { MaintenanceFrequency } from "../../services/request/crateMaintenaceRequest";

const FREQUENCY_OPTIONS = [
  { label: "Diario", value: MaintenanceFrequency.DAILY },
  { label: "Semanal", value: MaintenanceFrequency.WEEKLY },
  { label: "Mensual", value: MaintenanceFrequency.MONTHLY },
  { label: "Trimestral", value: MaintenanceFrequency.QUARTERLY },
  { label: "Semestral", value: MaintenanceFrequency.SEMIANNUAL },
  { label: "Anual", value: MaintenanceFrequency.ANNUAL },
];

export default function MaintenanceForm() {
  const { data: providers } = useProviderQuery();
  const { data: areas } = useAreaQuery();

  const { control, errors, handleSubmit, isSubmitting } = useFormMaintenance();

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* ZONA COMÚN */}
      <Controller
        name="commonAreaId"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Zona común"
            options={areas?.map((a) => ({ label: a.name, value: a.id })) ?? []}
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.commonAreaId?.message}
          />
        )}
      />

      {/* PROVEEDOR */}
      <Controller
        name="providerId"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Proveedor"
            options={
              providers?.map((p) => ({ label: p.name, value: p.id })) ?? []
            }
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.providerId?.message}
          />
        )}
      />

      {/* FECHA */}
      <Controller
        name="lastMaintenanceDate"
        control={control}
        render={({ field }) => (
          <InputField
            type="date"
            label="Último mantenimiento"
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.lastMaintenanceDate?.message}
          />
        )}
      />

      {/* FRECUENCIA */}
      <Controller
        name="frequency"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Frecuencia"
            options={FREQUENCY_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.frequency?.message}
          />
        )}
      />

      {/* NOTAS */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <TextAreaField
            label="Notas"
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.notes?.message}
          />
        )}
      />

      <Button
        type="submit"
        size="full"
        colVariant="warning"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : "Crear el mantenimiento"}
      </Button>
    </form>
  );
}
