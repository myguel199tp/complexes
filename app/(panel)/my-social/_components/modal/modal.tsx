"use client";
import { Buton, Modal, Text } from "complexes-next-components";
import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useForm from "./use-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activityId: string;
  dateHourStart: string;
  dateHourEnd: string;
  cuantity: number;
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

  const getDynamicMinTime = () => {
    if (!startDate) return minTime;
    const isToday = startDate.toDateString() === new Date().toDateString();
    if (!isToday) return minTime;
    const now = new Date();
    return now > maxTime ? maxTime : now > minTime ? now : minTime;
  };

  const { register, setValue, handleSubmit, isSuccess } = useForm({
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

  return (
    <div className="w-full flex justify-center">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form onSubmit={handleSubmit}>
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
            className="bg-gray-200 p-3 rounded-md w-[250px]"
            placeholderText="Selecciona fecha y hora"
            minDate={new Date()}
            minTime={getDynamicMinTime()}
            maxTime={maxTime}
          />

          {/* Mostrar barra de ocupación si hay hora seleccionada */}
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
                <Text className="text-red-600 text-center font-bold mt-1">
                  No hay cupos disponibles en esta hora
                </Text>
              )}
            </>
          )}

          <textarea
            {...register("description")}
            className="bg-gray-200 w-full p-4 rounded-md mt-4"
            placeholder="Contenido"
          />

          <div className="flex w-full items-center justify-center gap-4 mt-4">
            <Buton colVariant="danger" rounded="lg" onClick={onClose}>
              Cancelar
            </Buton>

            <Buton
              colVariant="primary"
              rounded="lg"
              size="md"
              borderWidth="semi"
              type="submit"
              disabled={isSuccess || isHourFull}
            >
              Generar reserva
            </Buton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
