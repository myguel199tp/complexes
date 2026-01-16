"use client";

import React from "react";
import {
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import { useFormMaintenance } from "./use-form-maintenance";
import { useProviders } from "./useProviders";
import { useCommonAreas } from "./useCommonAreas";
import { FREQUENCY_OPTIONS } from "./frequency-options";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

interface Props {
  maintenanceId?: string;
  defaultValues?: any;
}

export default function MaintenanceForm({
  maintenanceId,
  defaultValues,
}: Props) {
  const conjuntoId = useConjuntoStore((s) => s.conjuntoId);

  const { data: providers } = useProviders(String(conjuntoId));
  const { data: areas } = useCommonAreas(String(conjuntoId));

  const { register, errors, handleSubmit, isSubmitting } = useFormMaintenance({
    maintenanceId,
    defaultValues,
  });

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      {/* ZONA COMÚN */}
      <SelectField
        label="Zona común"
        {...register("commonAreaId")}
        options={areas?.map((a: any) => ({
          label: a.name,
          value: a.id,
        }))}
        errorMessage={errors.commonAreaId?.message}
      />

      {/* PROVEEDOR */}
      <SelectField
        label="Proveedor"
        {...register("providerId")}
        options={providers?.map((p: any) => ({
          label: p.name,
          value: p.id,
        }))}
        errorMessage={errors.providerId?.message}
      />

      {/* FECHA */}
      <InputField
        type="date"
        label="Último mantenimiento"
        {...register("lastMaintenanceDate")}
        errorMessage={errors.lastMaintenanceDate?.message}
      />

      {/* FRECUENCIA */}
      <SelectField
        label="Frecuencia"
        {...register("frequency")}
        options={FREQUENCY_OPTIONS}
        errorMessage={errors.frequency?.message}
      />

      {/* NOTAS */}
      <TextAreaField
        label="Notas"
        {...register("notes")}
        errorMessage={errors.notes?.message}
      />

      <Button
        type="submit"
        colVariant="warning"
        size="full"
        disabled={isSubmitting}
      >
        {maintenanceId ? "Actualizar mantenimiento" : "Crear mantenimiento"}
      </Button>
    </form>
  );
}
