"use client";
import {
  Button,
  InputField,
  Modal,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { useForm } from "./use-form";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";

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

  const minTime = new Date(today);
  minTime.setHours(startHours, startMinutes, 0, 0);

  const maxTime = new Date(today);
  maxTime.setHours(endHours, endMinutes, 0, 0);

  // ✅ minTime dinámico: si es hoy, se compara con la hora actual
  const getDynamicMinTime = () => {
    if (!startDate) return minTime;

    const currentDate = new Date();
    const isToday = startDate.toDateString() === currentDate.toDateString();

    if (!isToday) {
      // Para fechas futuras, la hora mínima es el horario de inicio
      return minTime;
    }

    // Para hoy, no permitir horas pasadas
    if (currentDate < minTime) return minTime;
    if (currentDate > maxTime) return maxTime;
    return currentDate;
  };

  const { register, setValue, handleSubmit } = useForm({
    activityId,
  });

  // 🔍 Contar reservas en la hora seleccionada
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
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form onSubmit={handleSubmit}>
          <Text className="my-3" size="md" font="bold">
            {activityname}
          </Text>

          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => {
              setStartDate(date);
              setValue("reservationDate", date ? date.toISOString() : "");
            }}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            dateFormat="Pp"
            className="bg-gray-200 p-3 rounded-md w-[250px] h-10 items-end"
            placeholderText="Selecciona fecha y hora"
            minDate={new Date()}
            minTime={getDynamicMinTime()}
            maxTime={maxTime}
          />

          <InputField
            className="mt-2"
            type="hidden"
            {...register("nameUnit")}
          />

          {/* Mostrar barra de ocupación si hay hora seleccionada */}
          {startDate && (
            <>
              <div className="w-full bg-gray-300 rounded h-4 overflow-hidden mt-4 ">
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
