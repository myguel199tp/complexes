"use client";

import React from "react";
import { InputField, SelectField, Text } from "complexes-next-components";
import useBookingForm from "./use-form";
import {
  PassengerType,
  AgeRange,
} from "../../../services/request/bookingRequest";

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

export default function BookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
}: Props) {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    passengersFieldArray: { fields, append, remove },
  } = useBookingForm({ holidayId, startDate, endDate, priceTotal });

  return (
    <div>
      <Text>{holidayId}</Text>
      <Text size="sm">Fecha de llegada: {formatDate(startDate)}</Text>
      <Text size="sm">Fecha de salida: {formatDate(endDate)}</Text>
      <Text size="sm">Total: {priceTotal}</Text>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / Video Link */}
        <InputField
          placeholder="Correo electronico"
          helpText="Correo electronico"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="email"
          {...register("email")}
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />
        <InputField
          placeholder="Nombre completo"
          helpText="Nombre completo"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          className="mt-2"
          type="text"
          {...register("nameMain")}
          hasError={!!errors.nameMain}
          errorMessage={errors.nameMain?.message}
        />

        {/* Pasajeros */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
          <label className="block mb-2">Pasajeros:</label>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 mb-2 rounded bg-red-500">
              <SelectField
                tKeyDefaultOption="Tipo de pasajero"
                options={Object.values(PassengerType).map((t) => ({
                  value: t,
                  label: t,
                }))}
                value={field.type}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = event.target.value as PassengerType;
                  setValue(`passengers.${index}.type`, val);
                }}
              />

              <InputField
                placeholder="Cantidad"
                className="mt-3"
                type="number"
                {...register(`passengers.${index}.quantity` as const, {
                  valueAsNumber: true,
                })}
                hasError={!!errors.passengers?.[index]?.quantity}
                errorMessage={errors.passengers?.[index]?.quantity?.message}
              />
              <SelectField
                tKeyDefaultOption="Rango de edad"
                className="mt-3"
                options={Object.values(AgeRange).map((a) => ({
                  value: a,
                  label: a,
                }))}
                value={field.ageRange}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = event.target.value as AgeRange;
                  setValue(`passengers.${index}.ageRange`, val);
                }}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-2 py-1 rounded mt-1"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              append({
                type: PassengerType.MAYOR,
                quantity: 1,
                ageRange: AgeRange.MAYOR,
              })
            }
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Agregar pasajero
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
