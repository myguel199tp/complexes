"use client";
import { Buton, Modal } from "complexes-next-components";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dateHourStart: string; // ej: "06:00"
  dateHourEnd: string; // ej: "17:15"
}

export default function ModalSocial({
  isOpen,
  onClose,
  title,
  dateHourStart,
  dateHourEnd,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);

  const today = new Date();
  const [startHours, startMinutes] = dateHourStart.split(":").map(Number);
  const [endHours, endMinutes] = dateHourEnd.split(":").map(Number);

  const minTime = new Date(today);
  minTime.setHours(startHours, startMinutes, 0, 0);

  const maxTime = new Date(today);
  maxTime.setHours(endHours, endMinutes, 0, 0);

  return (
    <div className="w-full">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            dateFormat="Pp"
            className="bg-gray-200 p-3 rounded-md w-[250px]"
            placeholderText="Selecciona fecha y hora"
            minTime={minTime}
            maxTime={maxTime}
          />

          <textarea
            className="bg-gray-200 w-full mt-4"
            placeholder="Comentario"
          />

          <div>
            de forma interna nombre correo numero de apartamento nombre del
            conjunto
          </div>

          <div className="flex w-full items-center justify-center gap-4 my-4">
            <Buton colVariant="danger" rounded="lg" onClick={onClose}>
              Cancelar
            </Buton>

            <Buton colVariant="primary" rounded="lg">
              Generar reserva
            </Buton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
