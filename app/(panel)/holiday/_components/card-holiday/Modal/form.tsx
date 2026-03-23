// "use client";

import React, { useEffect, useState } from "react";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { Controller } from "react-hook-form";

import {
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";

import useBookingForm from "./use-form";
import {
  PassengerType,
  AgeRange,
} from "../../../services/request/bookingRequest";

import { useAuth } from "@/app/middlewares/useAuth";
import { AlertFlag } from "@/app/components/alertFalg";
import { IoArrowBack } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRegisterOptions } from "@/app/(dashboard)/soluciones/demost/_components/register-options";

interface FormState {
  userName: string;
  userLastName: string;
  email: string;
  numberId: string;
}

interface Props {
  holidayId: string;
  startDate: string;
  endDate: string;
  priceTotal: number;
  maxGuests: number;
  onBack: () => void;
}

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

function calculateNights(startDate: string, endDate: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
}

function formatDate(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingForm({
  holidayId,
  startDate,
  endDate,
  priceTotal,
  maxGuests,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { indicativeOptions } = useRegisterOptions();
  const nights = calculateNights(startDate, endDate);

  const {
    control,
    handleSubmit,
    formState,
    register,
    setValue,
    watch,
    passengersFieldArray: { fields, append, remove },
    guestsFieldArray: {
      fields: guestFields,
      append: appendGuest,
      remove: removeGuest,
    },
  } = useBookingForm({ holidayId, startDate, endDate, priceTotal, nights });

  const MAX_GROUPS = 3;

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

  const totalGuests = summary.adultos + summary.ninos + summary.bebes;

  const passengersList = [
    ...Array(summary.adultos).fill("adulto"),
    ...Array(summary.ninos).fill("nino"),
    ...Array(summary.bebes).fill("bebe"),
  ];

  // quitar el titular (primer adulto)
  const passengersToRender =
    summary.adultos > 0 ? passengersList.slice(1) : passengersList;

  const isLoggedIn = useAuth();

  const [valueState, setValueState] = useState<FormState>({
    userName: "",
    userLastName: "",
    email: "",
    numberId: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      const payload = getTokenPayload();

      const userName = payload?.name || "";
      const userLastName = payload?.lastName || "";
      const email = payload?.email || "";
      const numberId = payload?.numberId || "";
      setValueState({
        userName,
        userLastName,
        email,
        numberId,
      });
    }
  }, [isLoggedIn]);
  const { userName, userLastName, email, numberId } = valueState;

  useEffect(() => {
    if (userName && userLastName) {
      setValue("nameMain", `${userName} ${userLastName}`);
      setValue("email", email);
      setValue("documentNumber", numberId);
    }
  }, [userName, userLastName, email, setValue, numberId]);

  useEffect(() => {
    const needed = passengersToRender.length;

    if (guestFields.length < needed) {
      for (let i = guestFields.length; i < needed; i++) {
        appendGuest({
          nameMain: "",
          documentNumber: "",
          email: "",
          indicative: "",
          phone: "",
        });
      }
    }

    if (guestFields.length > needed) {
      for (let i = guestFields.length; i > needed; i--) {
        removeGuest(i - 1);
      }
    }
  }, [appendGuest, guestFields.length, passengersToRender.length, removeGuest]);
  return (
    <div key={language} className="bg-gray-50 min-h-screen py-3 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-3">
          {/* TITULAR */}
          <div className="bg-white rounded-xl shadow-sm p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-black transition"
              >
                <IoArrowBack size={18} />
              </button>

              <div>
                <Text size="sm" font="bold">
                  Datos del titular
                </Text>
                <p className="text-xs text-gray-500">
                  Verifica tu información. Solo puedes editar tu número de
                  celular.
                </p>
              </div>
            </div>

            <input type="hidden" {...register("email")} />
            <input type="hidden" {...register("nameMain")} />
            <input type="hidden" {...register("documentNumber")} />

            <div className="grid md:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border">
              <InputField
                helpText="Correo electrónico"
                inputSize="xs"
                defaultValue={email}
                disabled
                className="opacity-70"
              />

              <InputField
                helpText="Nombre completo"
                inputSize="xs"
                value={`${userName} ${userLastName}`}
                disabled
                className="opacity-70"
              />

              <InputField
                helpText="Número de documento"
                inputSize="xs"
                defaultValue={numberId}
                disabled
                className="opacity-70"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Text size="xs" font="bold" className="text-green-600">
                  Único dato requerido
                </Text>
                <span className="text-xs text-gray-500">
                  (Este campo sí es editable)
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Controller
                  control={control}
                  name="indicative"
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      inputSize="xs"
                      rounded="md"
                      options={indicativeOptions}
                      defaultOption={t("indicativo")}
                      searchable
                      className="text-gray-800 md:w-36"
                      errorMessage={formState.errors.indicative?.message}
                    />
                  )}
                />

                <InputField
                  placeholder={t("celular")}
                  inputSize="xs"
                  rounded="md"
                  {...register("phone")}
                  errorMessage={formState.errors.phone?.message}
                  className="flex-1 border-2 border-green-500 focus:border-green-600"
                />
              </div>
            </div>
          </div>

          {/* HUESPEDES */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 border">
            <Text size="sm" font="bold">
              Huéspedes
            </Text>

            <div className="bg-gray-50 rounded-lg p-3 flex justify-between text-sm">
              <span>
                Adultos <b>{summary.adultos}</b>
              </span>
              <span>
                Niños <b>{summary.ninos}</b>
              </span>
              <span>
                Bebés <b>{summary.bebes}</b>
              </span>
              <span className="text-gray-500">
                Total <b>{totalGuests}</b> / {maxGuests}
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const type = watch(`passengers.${index}.type`);
                const age = watch(`passengers.${index}.ageRange`);

                return (
                  <div
                    key={field.id}
                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition space-y-3"
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
                            AGE_RANGE_BY_PASSENGER_TYPE[t][0],
                          );
                        }}
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
                            e.target.value as AgeRange,
                          )
                        }
                      />

                      <InputField
                        type="number"
                        placeholder="Cantidad"
                        inputSize="xxs"
                        value={watch(`passengers.${index}.quantity`) || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;

                          const passengers = watch("passengers") || [];

                          const totalWithoutCurrent = passengers.reduce(
                            (acc, p, i) => {
                              if (i === index) return acc;
                              return acc + (p.quantity || 0);
                            },
                            0,
                          );

                          const maxAllowed = maxGuests - totalWithoutCurrent;

                          if (val > maxAllowed) {
                            setValue(
                              `passengers.${index}.quantity`,
                              maxAllowed,
                            );
                            return;
                          }

                          setValue(`passengers.${index}.quantity`, val);
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar grupo
                    </button>
                  </div>
                );
              })}
            </div>

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
              className="text-green-600 text-sm font-semibold hover:underline disabled:text-gray-400"
            >
              + Agregar tipo de huésped
            </button>

            <div className="space-y-4">
              {guestFields.map((field, index) => {
                const type = passengersToRender[index];

                return (
                  <div
                    key={field.id}
                    className="bg-gray-50 border rounded-xl p-4 space-y-2"
                  >
                    <h4 className="text-sm font-semibold">
                      {type === "adulto"
                        ? `Adulto ${index + 2}`
                        : type === "nino"
                          ? `Niño ${index + 1}`
                          : `Bebé ${index + 1}`}
                    </h4>

                    {type === "adulto" ? (
                      <>
                        <InputField
                          placeholder="Nombre y apellido"
                          {...register(`guestsInfos.${index}.nameMain`)}
                        />

                        <InputField
                          placeholder="Cédula o pasaporte"
                          {...register(`guestsInfos.${index}.documentNumber`)}
                        />

                        <InputField
                          placeholder="Email"
                          {...register(`guestsInfos.${index}.email`)}
                        />

                        <InputField
                          placeholder="Indicativo"
                          {...register(`guestsInfos.${index}.indicative`)}
                        />

                        <InputField
                          placeholder="Celular"
                          {...register(`guestsInfos.${index}.phone`)}
                        />
                      </>
                    ) : (
                      <>
                        <InputField
                          placeholder="Nombre y apellido"
                          {...register(`guestsInfos.${index}.nameMain`)}
                        />

                        <InputField
                          placeholder="Documento de identidad"
                          {...register(`guestsInfos.${index}.documentNumber`)}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={totalGuests > maxGuests}
            colVariant="warning"
            size="full"
          >
            Confirmar reserva
          </Button>

          <AlertFlag />
        </form>

        {/* RESUMEN */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white rounded-xl shadow-md p-5 border space-y-4">
            <Text size="lg" font="bold">
              Tu reserva
            </Text>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Llegada</span>
                <span className="font-semibold">{formatDate(startDate)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Salida</span>
                <span className="font-semibold">{formatDate(endDate)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Noches</span>
                <span className="font-semibold">{nights}</span>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="text-2xl font-bold text-green-600">
                ${priceTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
