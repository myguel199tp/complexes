"use client";

import React from "react";
import {
  Button,
  SelectField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { Controller } from "react-hook-form";
import { useFormMaintenance } from "./use-form-maintenance";
import { useProviderQuery } from "./use-provider-query";
import { useAreaQuery } from "./use-area-query";
import { MaintenanceFrequency } from "../../services/request/crateMaintenaceRequest";
import DateField from "@/app/components/ui/date-field/DateField";

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
    <div className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full"
      >
        <Controller
          name="commonAreaId"
          control={control}
          render={({ field }) => (
            <SelectField
              helpText="Zona común"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              className="w-full"
              options={areas?.map((a) => ({ label: a.name, value: a.id })) ?? []}
              defaultOption="Zona común"
              value={field.value}
              onChange={field.onChange}
              hasError={!!errors.commonAreaId}
              errorMessage={errors.commonAreaId?.message}
            />
          )}
        />

        <section className="w-full flex flex-col md:!flex-row gap-2 mt-2">
          <div className="w-full md:!w-[70%]">
            <Controller
              name="providerId"
              control={control}
              render={({ field }) => (
                <SelectField
                  helpText="Proveedor"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  className="mt-2 w-full"
                  options={
                    providers
                      // Un aliado con la alianza cancelada o suspendida no puede
                      // recibir trabajo nuevo; el backend además lo rechaza.
                      ?.filter((p) => p.isActive)
                      .map((p) => ({
                        label:
                          p.origin === "b2b"
                            ? `${p.name} · Aliado B2B`
                            : p.name,
                        value: p.id,
                      })) ?? []
                  }
                  defaultOption="Proveedor"
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.providerId}
                  errorMessage={errors.providerId?.message}
                />
              )}
            />

            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <SelectField
                  helpText="Frecuencia"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="md"
                  className="mt-2 w-full"
                  options={FREQUENCY_OPTIONS}
                  defaultOption="Frecuencia"
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.frequency}
                  errorMessage={errors.frequency?.message}
                />
              )}
            />

            <Controller
              name="lastMaintenanceDate"
              control={control}
              render={({ field }) => (
                <DateField
                  label="Último mantenimiento"
                  className="mt-2"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  errorMessage={errors.lastMaintenanceDate?.message}
                />
              )}
            />
          </div>

          <div className="w-full md:w-[52%] flex flex-col">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <>
                  <TextAreaField
                    placeholder="Notas del mantenimiento"
                    className="mt-2 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    maxLength={450}
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={errors.notes?.message}
                  />
                  <Text size="xs" className="text-right text-gray-500">
                    Máximo 450 caracteres
                  </Text>
                </>
              )}
            />
          </div>
        </section>

        <Button
          type="submit"
          size="full"
          rounded="md"
          colVariant="success"
          disabled={isSubmitting}
          className="mt-4 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          {isSubmitting ? "Guardando..." : "Crear el mantenimiento"}
        </Button>
      </form>
    </div>
  );
}
