"use client";

import React from "react";
import { Flag, InputField, SelectField, Text } from "complexes-next-components";
import useBookingForm from "./use-form";
import {
  PassengerType,
  AgeRange,
} from "../../../services/request/bookingRequest";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useRouter } from "next/navigation";

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
}

/* ================= REGLAS ================= */

const AGE_RANGE_BY_PASSENGER_TYPE: Record<PassengerType, AgeRange[]> = {
  [PassengerType.MAYOR]: [AgeRange.MAYOR],
  [PassengerType.MENOR]: [AgeRange.CHILD, AgeRange.TEEN],
  [PassengerType.BEBE]: [AgeRange.INFANT],
};

const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  [AgeRange.INFANT]: "Bebé (0–2 años)",
  [AgeRange.CHILD]: "Niño (3–11 años)",
  [AgeRange.TEEN]: "Adolescente (12–17 años)",
  [AgeRange.MAYOR]: "Adulto (18+)",
};

const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  [PassengerType.MAYOR]: "Adultos",
  [PassengerType.MENOR]: "Niños",
  [PassengerType.BEBE]: "Bebés",
};

/* ================= UTILS ================= */

function calculateNights(startDate: string, endDate: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatDate(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(d.getDate()).padStart(2, "0")}`;
}

/* ================= COMPONENT ================= */

export default function BookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
}: Props) {
  const nights = calculateNights(startDate, endDate);
  const router = useRouter();
  const payload = getTokenPayload();

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
    passengersFieldArray: { fields, append, remove },
  } = useBookingForm({ holidayId, startDate, endDate, priceTotal, nights });

  const MAX_GROUPS = 3;

  /* 🔥 RESUMEN DE HUÉSPEDES */
  const passengers = watch("passengers") || [];

  const summary = {
    adultos: passengers
      .filter((p) => p.type === PassengerType.MAYOR)
      .reduce((a, b) => a + (b.quantity || 0), 0),
    ninos: passengers
      .filter((p) => p.type === PassengerType.MENOR)
      .reduce((a, b) => a + (b.quantity || 0), 0),
    bebes: passengers
      .filter((p) => p.type === PassengerType.BEBE)
      .reduce((a, b) => a + (b.quantity || 0), 0),
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-5xl mx-auto space-y-6">
      {/* ================= RESUMEN ================= */}
      <div className="flex justify-between">
        <div className="border-b pb-4">
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
        {!storedUserId && (
          <Flag
            colVariant="primary"
            background="default"
            size="sm"
            className="mt-2 w-full"
          >
            <div className="flex flex-col gap-3">
              <Text size="sm" font="bold">
                Para continuar con la reserva necesitas una cuenta
              </Text>

              <Text size="xs" className="text-gray-600">
                Inicia sesión si ya tienes una cuenta o crea una nueva para
                confirmar tu reserva.
              </Text>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/auth/register")}
                  className="px-4 py-2 text-sm rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Crear cuenta
                </button>
              </div>
            </div>
          </Flag>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= TITULAR ================= */}
          <div className="space-y-4">
            <Text size="md" font="bold">
              Datos del titular
            </Text>
            <Text size="sm" className="text-gray-500">
              Persona responsable de la reserva
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
              {...register("nameMain")}
              hasError={!!errors.nameMain}
              errorMessage={errors.nameMain?.message}
            />
          </div>

          {/* ================= HUÉSPEDES ================= */}
          <div className="space-y-3">
            <Text size="md" font="bold">
              Huéspedes
            </Text>

            <Text size="sm" className="text-gray-600">
              ¿Cuántas personas se hospedarán?
            </Text>

            {/* 🔥 RESUMEN CLARO */}
            <div className="bg-gray-100 rounded-lg p-3 text-sm">
              Adultos: <b>{summary.adultos}</b> · Niños: <b>{summary.ninos}</b>{" "}
              · Bebés: <b>{summary.bebes}</b>
            </div>

            <div className="border rounded-lg p-3 space-y-3 max-h-[200px] overflow-y-auto">
              {fields.map((field, index) => {
                const type = watch(`passengers.${index}.type`);
                const age = watch(`passengers.${index}.ageRange`);

                return (
                  <div
                    key={field.id}
                    className="bg-gray-50 border rounded-lg p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <SelectField
                        options={Object.values(PassengerType).map((t) => ({
                          value: t,
                          label: PASSENGER_TYPE_LABELS[t],
                        }))}
                        value={type}
                        onChange={(e) => {
                          const t = e.target.value as PassengerType;
                          setValue(`passengers.${index}.type`, t);
                          setValue(
                            `passengers.${index}.ageRange`,
                            AGE_RANGE_BY_PASSENGER_TYPE[t][0]
                          );
                        }}
                      />

                      <InputField
                        type="number"
                        inputSize="sm"
                        placeholder="Cantidad"
                        {...register(`passengers.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />

                      <SelectField
                        options={AGE_RANGE_BY_PASSENGER_TYPE[type].map((a) => ({
                          value: a,
                          label: AGE_RANGE_LABELS[a],
                        }))}
                        value={age}
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
                      Eliminar grupo
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                disabled={fields.length >= MAX_GROUPS}
                onClick={() =>
                  append({
                    type: PassengerType.MAYOR,
                    quantity: 1,
                    ageRange: AgeRange.MAYOR,
                  })
                }
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              >
                + Agregar tipo de huésped
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t mt-6">
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
            Confirmar reserva
          </button>
        </div>
      </form>
    </div>
  );
}
