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

/* ================= REGLAS DE NEGOCIO ================= */

// Qué edades son válidas según el tipo
const AGE_RANGE_BY_PASSENGER_TYPE: Record<PassengerType, AgeRange[]> = {
  [PassengerType.MAYOR]: [AgeRange.MAYOR],
  [PassengerType.MENOR]: [AgeRange.CHILD, AgeRange.TEEN],
  [PassengerType.BEBE]: [AgeRange.INFANT],
};

// Labels claros
const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  [AgeRange.INFANT]: "Bebé (0–2 años)",
  [AgeRange.CHILD]: "Niño (3–11 años)",
  [AgeRange.TEEN]: "Adolescente (12–17 años)",
  [AgeRange.MAYOR]: "Adulto (18+)",
};

const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  [PassengerType.MAYOR]: "Adulto",
  [PassengerType.MENOR]: "Menor",
  [PassengerType.BEBE]: "Bebé",
};

/* ================= UTILS ================= */

function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

/* ================= COMPONENT ================= */

export default function BookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
}: Props) {
  const nights = calculateNights(startDate, endDate);
  const {
    handleSubmit,
    register,
    setValue,
    watch, // ✅ MUY IMPORTANTE
    formState: { errors },
    passengersFieldArray: { fields, append, remove },
  } = useBookingForm({ holidayId, startDate, endDate, priceTotal, nights });

  return (
    <div className="bg-white rounded-xl shadow-2xl shadow-gray-300 p-6 space-y-6 max-w-5xl mx-auto">
      {/* ================= RESUMEN ================= */}
      <div className="border-b pb-4 space-y-1">
        <Text size="lg" font="bold">
          Resumen de la reserva
        </Text>

        <Text size="sm">Llegada: {formatDate(startDate)}</Text>
        <Text size="sm">Salida: {formatDate(endDate)}</Text>

        <Text size="sm" font="bold">
          {nights} {nights === 1 ? "noche" : "noches"}
        </Text>

        <Text size="md" font="bold">
          Total: ${priceTotal.toLocaleString()}
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= TITULAR ================= */}
          <div className="space-y-4">
            <Text size="md" font="bold">
              Datos del titular
            </Text>

            <InputField
              placeholder="Correo electrónico"
              type="email"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <InputField
              placeholder="Nombre completo"
              type="text"
              {...register("nameMain")}
              hasError={!!errors.nameMain}
              errorMessage={errors.nameMain?.message}
            />
          </div>

          {/* ================= HUÉSPEDES ================= */}
          <div className="space-y-1">
            <Text size="md" font="bold">
              Huéspedes
            </Text>

            <div className="border rounded-lg p-3">
              <div className="max-h-[150px] overflow-y-auto space-y-3 pr-2">
                {fields.map((field, index) => {
                  // 🔥 VALORES REALES DEL FORM
                  const passengerType = watch(
                    `passengers.${index}.type`
                  ) as PassengerType;

                  const passengerAge = watch(
                    `passengers.${index}.ageRange`
                  ) as AgeRange;

                  const allowedAges =
                    AGE_RANGE_BY_PASSENGER_TYPE[passengerType];

                  return (
                    <div
                      key={field.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* TIPO */}
                        <SelectField
                          tKeyDefaultOption="Tipo"
                          options={Object.values(PassengerType).map((t) => ({
                            value: t,
                            label: PASSENGER_TYPE_LABELS[t],
                          }))}
                          value={passengerType}
                          onChange={(e) => {
                            const type = e.target.value as PassengerType;

                            setValue(`passengers.${index}.type`, type);

                            // 🔒 Forzar edad válida
                            setValue(
                              `passengers.${index}.ageRange`,
                              AGE_RANGE_BY_PASSENGER_TYPE[type][0]
                            );
                          }}
                        />

                        {/* CANTIDAD */}
                        <InputField
                          placeholder="Cantidad"
                          inputSize="sm"
                          type="number"
                          {...register(`passengers.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />

                        {/* EDAD */}
                        <SelectField
                          tKeyDefaultOption="Edad"
                          options={allowedAges.map((a) => ({
                            value: a,
                            label: AGE_RANGE_LABELS[a],
                          }))}
                          value={passengerAge}
                          onChange={(e) =>
                            setValue(
                              `passengers.${index}.ageRange`,
                              e.target.value as AgeRange
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar huésped
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    type: PassengerType.MAYOR,
                    quantity: 1,
                    ageRange: AgeRange.MAYOR,
                  })
                }
                className="mt-3 text-blue-600 text-sm hover:underline"
              >
                + Agregar huésped
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t mt-6">
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-semibold"
          >
            Confirmar reserva
          </button>
        </div>
      </form>
    </div>
  );
}
