"use client";
import {
  Button,
  InputField,
  Modal,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useState, useMemo } from "react";
import { useForm } from "./use-form";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activityId: string;
  dateHourStart: string;
  dateHourEnd: string;
  cuantity: number;
  activityname: string;
  reservations: { reservationDate: string }[];
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

  const { register, setValue, handleSubmit } = useForm({ activityId });
  const { t } = useTranslation();

  // Contar reservas en la hora seleccionada
  const reservationsForSelectedHour = useMemo(() => {
    if (!startDate) return [];
    return reservations.filter((res) => {
      const resDate = new Date(res.reservationDate);
      return (
        resDate.getFullYear() === startDate.getFullYear() &&
        resDate.getMonth() === startDate.getMonth() &&
        resDate.getDate() === startDate.getDate() &&
        resDate.getHours() === startDate.getHours() &&
        resDate.getMinutes() === startDate.getMinutes()
      );
    });
  }, [startDate, reservations]);

  const used = reservationsForSelectedHour.length;
  const available = Math.max(cuantity - used, 0);
  const isHourFull = available <= 0;
  const percentageUsed = (used / cuantity) * 100;

  // MinDateTime dinámico según fecha seleccionada
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
      0
    );

    return isToday && now > minDateTime ? now : minDateTime;
  };

  // MaxDateTime según fecha seleccionada
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
      0
    );
  };

  return (
    <div className="w-full flex justify-center">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form onSubmit={handleSubmit}>
          <Text className="my-3" size="md" font="bold">
            {activityname}
          </Text>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={t("Fecha y hora")}
              value={startDate}
              onChange={(newDate) => {
                setStartDate(newDate);
                setValue(
                  "reservationDate",
                  newDate ? newDate.toISOString() : ""
                );
              }}
              minDate={today} // permite seleccionar hoy o cualquier día futuro
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
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <InputField
            className="mt-2"
            type="hidden"
            {...register("nameUnit")}
          />

          {startDate && (
            <>
              <div className="w-full bg-gray-300 rounded h-4 overflow-hidden mt-4">
                <div
                  className={`h-4 ${
                    isHourFull ? "bg-red-500" : "bg-blue-500"
                  } transition-all duration-300`}
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
              <Text className="text-sm mt-1 text-center">
                {used} de {cuantity} cupo(s) ocupados en esta hora
              </Text>
              {isHourFull && (
                <Text size="sm" colVariant="danger">
                  No hay cupos disponibles en esta hora
                </Text>
              )}
            </>
          )}

          <TextAreaField
            {...register("description")}
            placeholder="Sugerencias"
            helpText="Sugerencias"
          />

          <div className="flex w-full items-center justify-center gap-4 mt-4">
            <Button
              colVariant="danger"
              size="sm"
              rounded="md"
              tKey={t("cancelar")}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              colVariant="warning"
              size="sm"
              disabled={isHourFull}
            >
              Generar reserva
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
