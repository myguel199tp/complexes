import React from "react";
import { Controller } from "react-hook-form";
import { Button, InputField, SelectField } from "complexes-next-components";
import { useFormLocal } from "./use-form";
import { LocalOperationType } from "../services/request/localsRequest";
import { useIndicativeOptions } from "./use-indicative";

export default function LocalForm() {
  const { control, onSubmit, operationType, isSubmitting, errors } =
    useFormLocal();
  const { indicativeOptions } = useIndicativeOptions();
  const OPERATION_TYPES = [
    { label: "Arriendo", value: LocalOperationType.RENT },
    { label: "Venta", value: LocalOperationType.SALE },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-2 mt-4">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Nombre del negocio"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.name?.message}
          />
        )}
      />
      <Controller
        name="plaque"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="placa del negocio"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.plaque?.message}
          />
        )}
      />

      <Controller
        name="kindOfBusiness"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Tipo de negocio (Ej: Restaurante, Tienda)"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.kindOfBusiness?.message}
          />
        )}
      />

      <Controller
        name="ownerName"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Nombre del propietario"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.ownerName?.message}
          />
        )}
      />

      <Controller
        name="ownerLastName"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Apellido del propietario"
            inputSize="sm"
            rounded="md"
            errorMessage={errors.ownerLastName?.message}
          />
        )}
      />

      <Controller
        name="indicative"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            searchable
            defaultOption="Indicativo"
            options={indicativeOptions}
            inputSize="sm"
            rounded="lg"
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Número de celular"
            inputSize="sm"
            rounded="md"
            regexType="number"
            errorMessage={errors.phone?.message}
          />
        )}
      />

      <Controller
        name="operationType"
        control={control}
        render={({ field }) => (
          <SelectField
            {...field}
            defaultOption="Tipo de operación"
            options={OPERATION_TYPES}
            inputSize="sm"
            rounded="lg"
            onChange={(value) => field.onChange(value)}
            errorMessage={errors.operationType?.message}
          />
        )}
      />

      {operationType === LocalOperationType.RENT && (
        <Controller
          name="rentValue"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              placeholder="Valor del arriendo"
              inputSize="sm"
              rounded="md"
              type="number"
              errorMessage={errors.rentValue?.message}
            />
          )}
        />
      )}

      {operationType === LocalOperationType.SALE && (
        <Controller
          name="salePrice"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              placeholder="Precio de venta"
              inputSize="sm"
              rounded="md"
              type="number"
              errorMessage={errors.salePrice?.message}
            />
          )}
        />
      )}

      <Controller
        name="administrationFee"
        control={control}
        render={({ field }) => (
          <InputField
            {...field}
            placeholder="Cuota de administración"
            inputSize="sm"
            rounded="md"
            type="number"
            errorMessage={errors.administrationFee?.message}
          />
        )}
      />

      <Button
        type="submit"
        size="full"
        disabled={isSubmitting}
        colVariant="warning"
      >
        {isSubmitting ? "Guardando..." : "Guardar local"}
      </Button>
    </form>
  );
}
