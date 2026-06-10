// "use client";

import React, { useEffect, useState } from "react";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { Controller } from "react-hook-form";

import {
  InputField,
  SelectField,
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
import { FiUser, FiUsers, FiLock, FiPhone, FiCalendar, FiMoon } from "react-icons/fi";

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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
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
      setValueState({
        userName: payload?.name || "",
        userLastName: payload?.lastName || "",
        email: payload?.email || "",
        numberId: payload?.numberId || "",
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
        appendGuest({ nameMain: "", documentNumber: "", email: "", indicative: "", phone: "" });
      }
    }
    if (guestFields.length > needed) {
      for (let i = guestFields.length; i > needed; i--) {
        removeGuest(i - 1);
      }
    }
  }, [appendGuest, guestFields.length, passengersToRender.length, removeGuest]);

  return (
    <div key={language} className="bg-gray-50 py-4 px-3 md:px-5">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">

          {/* ── Step header ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all flex-shrink-0"
            >
              <IoArrowBack size={16} />
            </button>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                Paso 2 de 2
              </p>
              <p className="text-sm font-bold text-gray-800 leading-tight">
                Confirma tu reserva
              </p>
            </div>
          </div>

          {/* ── Titular card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-700 to-blue-800 px-5 py-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <FiUser size={14} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Datos del titular
                </p>
                <p className="text-cyan-200/80 text-xs">
                  Verifica tu información. Solo puedes editar tu celular.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5 space-y-4">
              <input type="hidden" {...register("email")} />
              <input type="hidden" {...register("nameMain")} />
              <input type="hidden" {...register("documentNumber")} />

              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Correo electrónico", value: email },
                  { label: "Nombre completo", value: `${userName} ${userLastName}`.trim() },
                  { label: "Número de documento", value: numberId },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {label}
                    </p>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-h-[42px]">
                      <FiLock size={11} className="text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-500 truncate">
                        {value || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phone — editable */}
              <div className="bg-cyan-50 rounded-xl p-3.5 border border-cyan-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <FiPhone size={9} /> Requerido
                  </span>
                  <span className="text-xs text-gray-500">
                    Único campo editable
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
                    className="flex-1 border-2 border-cyan-400 focus:border-cyan-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Huéspedes card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <FiUsers size={14} className="text-white" />
              </div>
              <p className="text-white font-semibold text-sm">Huéspedes</p>
            </div>

            <div className="p-4 md:p-5 space-y-4">
              {/* Guest summary pills */}
              <div className="flex flex-wrap gap-2">
                {summary.adultos > 0 && (
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-full font-semibold">
                    👤 {summary.adultos} Adulto{summary.adultos !== 1 ? "s" : ""}
                  </span>
                )}
                {summary.ninos > 0 && (
                  <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 text-xs px-3 py-1.5 rounded-full font-semibold">
                    🧒 {summary.ninos} Niño{summary.ninos !== 1 ? "s" : ""}
                  </span>
                )}
                {summary.bebes > 0 && (
                  <span className="flex items-center gap-1.5 bg-pink-50 text-pink-600 border border-pink-200 text-xs px-3 py-1.5 rounded-full font-semibold">
                    👶 {summary.bebes} Bebé{summary.bebes !== 1 ? "s" : ""}
                  </span>
                )}
                <span
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border ${
                    totalGuests > maxGuests
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  Total: {totalGuests} / {maxGuests}
                </span>
              </div>

              {/* Passenger groups */}
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const type = watch(`passengers.${index}.type`);
                  const age = watch(`passengers.${index}.ageRange`);

                  return (
                    <div
                      key={field.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Grupo {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <SelectField
                          options={Object.values(PassengerType).map((pt) => ({
                            value: pt,
                            label: PASSENGER_TYPE_LABELS[pt],
                          }))}
                          value={type}
                          onChange={(e) => {
                            const pt = e.target.value as PassengerType;
                            setValue(`passengers.${index}.type`, pt);
                            setValue(
                              `passengers.${index}.ageRange`,
                              AGE_RANGE_BY_PASSENGER_TYPE[pt][0],
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
                            const allPassengers = watch("passengers") || [];
                            const totalWithoutCurrent = allPassengers.reduce(
                              (acc, p, i) => (i === index ? acc : acc + (p.quantity || 0)),
                              0,
                            );
                            const maxAllowed = maxGuests - totalWithoutCurrent;
                            setValue(
                              `passengers.${index}.quantity`,
                              val > maxAllowed ? maxAllowed : val,
                            );
                          }}
                        />
                      </div>
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
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-cyan-400 text-gray-500 hover:text-cyan-600 text-sm font-medium transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                + Agregar tipo de huésped
              </button>

              {/* Individual guest forms */}
              {guestFields.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Información de acompañantes
                  </p>
                  {guestFields.map((field, index) => {
                    const type = passengersToRender[index];
                    const typeLabel =
                      type === "adulto"
                        ? `Adulto ${index + 2}`
                        : type === "nino"
                          ? `Niño ${index + 1}`
                          : `Bebé ${index + 1}`;

                    const badgeClass =
                      type === "adulto"
                        ? "bg-blue-100 text-blue-700"
                        : type === "nino"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-pink-100 text-pink-700";

                    return (
                      <div
                        key={field.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5"
                      >
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                          {typeLabel}
                        </span>

                        {type === "adulto" ? (
                          <>
                            <InputField
                              placeholder="Nombre y apellido"
                              inputSize="xs"
                              {...register(`guestsInfos.${index}.nameMain`)}
                            />
                            <InputField
                              placeholder="Cédula o pasaporte"
                              inputSize="xs"
                              {...register(`guestsInfos.${index}.documentNumber`)}
                            />
                            <InputField
                              placeholder="Email"
                              inputSize="xs"
                              {...register(`guestsInfos.${index}.email`)}
                            />
                            <div className="flex flex-col md:flex-row gap-2">
                              <Controller
                                control={control}
                                name={`guestsInfos.${index}.indicative`}
                                render={({ field }) => (
                                  <SelectField
                                    {...field}
                                    inputSize="xs"
                                    rounded="md"
                                    options={indicativeOptions}
                                    defaultOption={t("indicativo")}
                                    searchable
                                    className="text-gray-800 md:w-36"
                                    errorMessage={
                                      formState.errors.guestsInfos?.[index]?.indicative?.message
                                    }
                                  />
                                )}
                              />
                              <InputField
                                placeholder="Celular"
                                inputSize="xs"
                                {...register(`guestsInfos.${index}.phone`)}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <InputField
                              placeholder="Nombre y apellido"
                              inputSize="xs"
                              {...register(`guestsInfos.${index}.nameMain`)}
                            />
                            <InputField
                              placeholder="Documento de identidad"
                              inputSize="xs"
                              {...register(`guestsInfos.${index}.documentNumber`)}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={totalGuests > maxGuests}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-200/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Confirmar reserva
          </button>

          <AlertFlag />
        </form>

        {/* ── Summary sidebar ── */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl text-white">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                Resumen de reserva
              </p>
              <p className="font-bold text-white text-base">Tu estadía</p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiCalendar size={13} />
                  <span>Llegada</span>
                </div>
                <span className="font-semibold text-sm text-white">
                  {formatDate(startDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiCalendar size={13} />
                  <span>Salida</span>
                </div>
                <span className="font-semibold text-sm text-white">
                  {formatDate(endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiMoon size={13} />
                  <span>Noches</span>
                </div>
                <span className="font-semibold text-sm text-white">{nights}</span>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total a pagar</span>
                <span className="text-2xl font-bold text-cyan-400">
                  ${priceTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* capacity warning */}
          {totalGuests > maxGuests && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
              ⚠ Excedes la capacidad máxima de {maxGuests} huéspedes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
