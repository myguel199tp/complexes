"use client";

import React from "react";
import { Button, InputField, SelectField } from "complexes-next-components";
import { useFormLocal } from "./use-form";
import { LocalOperationType } from "../services/request/localsRequest";
import { useIndicativeOptions } from "./use-indicative";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function LocalForm() {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    setValue,
    watch,
  } = useFormLocal();

  const { indicativeOptions } = useIndicativeOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const operationType = watch("operationType");

  const OPERATION_TYPES = [
    { label: t("arriendo"), value: LocalOperationType.RENT },
    { label: t("venta"), value: LocalOperationType.SALE },
  ];

  return (
    <div className="mt-1" key={language}>
      <form
        onSubmit={handleSubmit}
        className="space-y-2 mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4"
      >
        <InputField
          placeholder="Nombre del negocio"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Nombre del negocio"
          {...register("name")}
          errorMessage={errors.name?.message}
        />

        <InputField
          placeholder="Placa del negocio"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Placa del negocio"
          {...register("plaque")}
          errorMessage={errors.plaque?.message}
        />

        <InputField
          placeholder="Tipo de negocio"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Tipo de negocio"
          {...register("kindOfBusiness")}
          errorMessage={errors.kindOfBusiness?.message}
        />

        <InputField
          placeholder="Nombre del propietario"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Nombre del propietario"
          {...register("ownerName")}
          errorMessage={errors.ownerName?.message}
        />

        <InputField
          placeholder="Apellido del propietario"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Apellido del propietario"
          {...register("ownerLastName")}
          errorMessage={errors.ownerLastName?.message}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <SelectField
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            helpText="Indicativo"
            options={indicativeOptions}
            defaultOption="Indicativo"
            searchable
            {...register("indicative")}
            onChange={(e) =>
              setValue("indicative", e.target.value, { shouldValidate: true })
            }
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />

          <InputField
            placeholder="Celular"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            {...register("phone")}
            errorMessage={errors.phone?.message}
          />
        </div>

        <SelectField
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Tipo de operación"
          options={OPERATION_TYPES}
          defaultOption="Tipo de operación"
          {...register("operationType")}
          onChange={(e) => {
            const value = e.target.value as LocalOperationType;
            setValue("operationType", value, { shouldValidate: true });

            if (value === LocalOperationType.RENT) {
              setValue("adminPrice", undefined);
            }

            if (value === LocalOperationType.SALE) {
              setValue("rentValue", undefined);
            }
          }}
          hasError={!!errors.operationType}
          errorMessage={errors.operationType?.message}
        />

        {operationType === LocalOperationType.RENT && (
          <InputField
            placeholder="Valor del arriendo"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            helpText="Valor del arriendo"
            {...register("rentValue")}
            errorMessage={errors.rentValue?.message}
          />
        )}

        {operationType === LocalOperationType.SALE && (
          <InputField
            placeholder="Precio de venta"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            helpText="Precio de venta"
            {...register("adminPrice")}
            errorMessage={errors.adminPrice?.message}
          />
        )}

        <InputField
          placeholder="Cuota de administración"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          helpText="Cuota de administración"
          {...register("administrationFee")}
          errorMessage={errors.administrationFee?.message}
        />

        <Button
          type="submit"
          size="full"
          colVariant="success"
          rounded="md"
          className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          disabled={isSubmitting}
        >
          Guardar local
        </Button>
      </form>
    </div>
  );
}
