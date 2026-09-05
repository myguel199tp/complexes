"use client";

import {
  Button,
  InputField,
  Modal,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useState } from "react";
import { useForm } from "./use-form";
import { useAvailabilityQuery } from "./use-availability-query";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useLanguage } from "@/app/hooks/useLanguage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activityId: string;
  dateHourStart: string;
  dateHourEnd: string;
  cuantity: number;
  activityname: string;
  reservations: { reservation_date: string }[];
}

export default function ModalSocial({
  isOpen,
  onClose,
  title,
  activityId,
  dateHourStart,
  dateHourEnd,
  cuantity,
  activityname,
  reservations,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const today = new Date();

  const [startHours, startMinutes] = dateHourStart.split(":").map(Number);
  const [endHours, endMinutes] = dateHourEnd.split(":").map(Number);

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ activityId });
  const { t } = useTranslation();
  const { language } = useLanguage();

  // La ocupación la calcula el backend: cada reserva puede traer varias
  // personas, así que contar reservas en el cliente daba un número engañoso.
  const { data: availability, isFetching: loadingAvailability } =
    useAvailabilityQuery(activityId, startDate ? startDate.toISOString() : null);

  const adults = Number(watch("adultsCount")) || 0;
  const minors = Number(watch("minorsCount")) || 0;
  const requested = adults + minors;

  const capacity = availability?.capacity ?? cuantity;
  const used = availability?.occupied ?? 0;
  const available = availability?.available ?? Math.max(capacity - used, 0);
  const percentageUsed = capacity > 0 ? (used / capacity) * 100 : 0;

  const apartmentLimit = availability?.apartmentLimit ?? null;
  const apartmentAvailable = availability?.apartmentAvailable ?? null;

  const isHourFull = !!startDate && available <= 0;
  const exceedsCapacity = !!startDate && requested > available;
  const exceedsApartment =
    !!startDate &&
    apartmentAvailable !== null &&
    requested > apartmentAvailable;

  const blockingMessage = !startDate
    ? "Elige la fecha y hora para ver los cupos disponibles."
    : isHourFull
      ? "No hay cupos disponibles en esta hora."
      : exceedsApartment
        ? `Tu apartamento solo puede llevar ${apartmentAvailable} persona(s) más en esta hora (máximo ${apartmentLimit}).`
        : exceedsCapacity
          ? `Solo quedan ${available} cupos en esta hora y estás pidiendo ${requested}.`
          : null;

  const canSubmit =
    !!startDate &&
    requested >= 1 &&
    !loadingAvailability &&
    !isHourFull &&
    !exceedsCapacity &&
    !exceedsApartment;

  const getDynamicMinDateTime = () => {
    const now = new Date();

    if (!startDate) {
      const minToday = new Date(today);
      minToday.setHours(startHours, startMinutes, 0, 0);
      return minToday;
    }

    const selectedDate = new Date(startDate);
    const isToday = selectedDate.toDateString() === now.toDateString();

    const minDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      startHours,
      startMinutes,
      0,
      0,
    );

    return isToday && now > minDateTime ? now : minDateTime;
  };

  const getMaxDateTime = () => {
    if (!startDate) {
      const maxToday = new Date(today);
      maxToday.setHours(endHours, endMinutes, 0, 0);
      return maxToday;
    }

    return new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      endHours,
      endMinutes,
      0,
      0,
    );
  };

  return (
    <div key={language} className="w-full flex justify-center">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <Text size="lg" font="bold" className="text-white">
              {activityname}
            </Text>

            <Text size="sm" className="text-white opacity-90">
              {dateHourStart} - {dateHourEnd}
            </Text>
          </div>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Text size="sm">Aforo total</Text>
                <Text size="md" font="bold">
                  {capacity} personas
                </Text>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <Text size="sm">
                  {apartmentLimit !== null
                    ? "Máximo por apartamento"
                    : "Reservas"}
                </Text>
                <Text size="md" font="bold">
                  {apartmentLimit !== null
                    ? `${apartmentLimit} personas`
                    : reservations.length}
                </Text>
              </div>
            </div>
            <DateTimePicker
              label={t("Fecha y hora")}
              value={startDate}
              onChange={(newDate) => {
                setStartDate(newDate);

                setValue(
                  "reservation_date",
                  newDate ? newDate.toISOString() : "",
                );
              }}
              minDate={today}
              minTime={getDynamicMinDateTime()}
              maxTime={getMaxDateTime()}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    backgroundColor: "#e5e7eb",
                    borderRadius: "0.375rem",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InputField
              regexType="number"
              type="number"
              min={0}
              helpText="Mayores de edad"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              {...register("adultsCount")}
              hasError={!!errors.adultsCount}
              errorMessage={errors.adultsCount?.message}
            />

            <InputField
              regexType="number"
              type="number"
              min={0}
              helpText="Menores de edad"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              {...register("minorsCount")}
              hasError={!!errors.minorsCount}
              errorMessage={errors.minorsCount?.message}
            />
          </div>

          <Text size="xs" className="mt-1 text-gray-500">
            Los menores ocupan cupo igual que un adulto y deben ir acompañados.
          </Text>

          {startDate && (
            <div className="mt-5">
              <div className="flex justify-between mb-2">
                <Text size="sm">Ocupación de la franja</Text>

                <Text
                  size="sm"
                  className={isHourFull ? "text-red-500" : "text-green-600"}
                >
                  {loadingAvailability
                    ? "Consultando..."
                    : `${available} disponibles`}
                </Text>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    isHourFull ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>

              <Text className="mt-2 text-center text-sm">
                {used} / {capacity} personas · llevas {requested}
              </Text>

              {apartmentLimit !== null && (
                <Text className="mt-1 text-center text-sm text-gray-600">
                  Tu apartamento: {availability?.apartmentOccupied ?? 0} de{" "}
                  {apartmentLimit} personas en esta hora
                </Text>
              )}
            </div>
          )}

          {blockingMessage && (
            <Text size="sm" colVariant="danger" className="mt-3 block">
              {blockingMessage}
            </Text>
          )}

          <TextAreaField
            {...register("description")}
            className="mt-4 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder={t("Escribe una observación o sugerencia")}
          />

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              colVariant="default"
              size="sm"
              rounded="lg"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              colVariant="success"
              size="sm"
              rounded="lg"
              disabled={!canSubmit}
            >
              Generar reserva
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
