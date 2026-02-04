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
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
        <InputField
          tKeyHelpText={t("nombrenogocio")}
          tKeyPlaceholder={t("nombrenogocio")}
          placeholder="Nombre del negocio"
          inputSize="sm"
          helpText="Nombre del negocio"
          sizeHelp="xs"
          rounded="md"
          {...register("name")}
          errorMessage={errors.name?.message}
        />

        <InputField
          tKeyHelpText={t("placanegocio")}
          tKeyPlaceholder={t("placanegocio")}
          placeholder="Placa del negocio"
          inputSize="sm"
          sizeHelp="xs"
          rounded="md"
          helpText="Placa del negocio"
          {...register("plaque")}
          errorMessage={errors.plaque?.message}
        />

        <InputField
          tKeyHelpText={t("tiponegocio")}
          tKeyPlaceholder={t("tiponegocio")}
          placeholder="Tipo de negocio"
          inputSize="sm"
          sizeHelp="xs"
          rounded="md"
          helpText="Tipo de negocio (Ej: Restaurante, Tienda)"
          {...register("kindOfBusiness")}
          errorMessage={errors.kindOfBusiness?.message}
        />

        <InputField
          tKeyHelpText={t("nombrepropietario")}
          tKeyPlaceholder={t("nombrepropietario")}
          placeholder="Nombre del propietario"
          inputSize="sm"
          sizeHelp="xs"
          rounded="md"
          helpText="Nombre del propietario"
          {...register("ownerName")}
          errorMessage={errors.ownerName?.message}
        />

        <InputField
          tKeyHelpText={t("apellidopropietario")}
          tKeyPlaceholder={t("apellidopropietario")}
          placeholder="Apellido del propietario"
          inputSize="sm"
          sizeHelp="xs"
          rounded="md"
          helpText="Apellido del propietario"
          {...register("ownerLastName")}
          errorMessage={errors.ownerLastName?.message}
        />

        <div className="block md:flex gap-3">
          <SelectField
            id="indicative"
            inputSize="sm"
            sizeHelp="xs"
            rounded="md"
            helpText={t("indicativo")}
            options={indicativeOptions}
            defaultOption={t("indicativo")}
            searchable
            {...register("indicative")}
            onChange={(e) =>
              setValue("indicative", e.target.value, { shouldValidate: true })
            }
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />

          <InputField
            placeholder={t("celular")}
            helpText={t("celular")}
            inputSize="sm"
            sizeHelp="xs"
            rounded="md"
            {...register("phone", {
              required: t("celularRequerido"),
              pattern: {
                value: /^[0-9]+$/,
                message: t("soloNumeros"),
              },
            })}
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
          />
        </div>
        <SelectField
          tKeyHelpText={t("tipoperacion")}
          tKeyDefaultOption={t("tipoperacion")}
          defaultOption="Tipo de operación"
          helpText="Tipo de operación"
          sizeHelp="xs"
          rounded="md"
          inputSize="sm"
          options={OPERATION_TYPES}
          {...register("operationType")}
          onChange={(e) => {
            const value = e.target.value as LocalOperationType;

            // setear operación
            setValue("operationType", value, { shouldValidate: true });

            // limpiar campos NO usados
            if (value === LocalOperationType.RENT) {
              setValue("adminPrice", undefined, { shouldValidate: false });
            }

            if (value === LocalOperationType.SALE) {
              setValue("rentValue", undefined, { shouldValidate: false });
            }
          }}
          hasError={!!errors.operationType}
          errorMessage={errors.operationType?.message}
        />

        {operationType === LocalOperationType.RENT && (
          <InputField
            tKeyHelpText={t("valorarriendo")}
            tKeyPlaceholder={t("valorarriendo")}
            placeholder="Valor del arriendo"
            inputSize="sm"
            sizeHelp="xs"
            rounded="md"
            helpText="Valor del arriendo"
            {...register("rentValue")}
            errorMessage={errors.rentValue?.message}
          />
        )}

        <InputField
          tKeyHelpText={t("cuotaadministracion")}
          tKeyPlaceholder={t("cuotaadministracion")}
          placeholder="Cuota administración"
          inputSize="sm"
          sizeHelp="xs"
          rounded="md"
          helpText="Cuota administración"
          {...register("administrationFee")}
          errorMessage={errors.administrationFee?.message}
        />

        <Button
          type="submit"
          size="full"
          colVariant="warning"
          tKey={t("guardarlocal")}
          disabled={isSubmitting}
        >
          Guardar local
        </Button>
      </form>
    </div>
  );
}
