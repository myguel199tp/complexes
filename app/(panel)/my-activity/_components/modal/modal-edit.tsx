"use client";

import React, { useEffect } from "react";
import {
  Modal,
  InputField,
  Buton,
  Text,
  TextAreaField,
  Button,
} from "complexes-next-components";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import MyactivityEditForminfo from "./myActivityEditForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  activity: string;
  startHour?: Date;
  endHour?: Date;
  description: string;
  cuantity: number;
}

export default function ModalEdit({
  isOpen,
  onClose,
  id,
  activity,
  startHour,
  endHour,
  description,
  cuantity,
}: Props) {
  const {
    handleIconClick,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    preview,
    fileInputRef,
    handleFileChange,
    register,
    setValue,
    handleSubmit,
    errors,
  } = MyactivityEditForminfo(id);

  // ✅ Sincronizar horas al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    setStartDate(startHour ?? null);
    setEndDate(endHour ?? null);

    if (startHour) {
      setValue("dateHourStart", startHour.toTimeString().slice(0, 5));
    }

    if (endHour) {
      setValue("dateHourEnd", endHour.toTimeString().slice(0, 5));
    }
  }, [isOpen, startHour, endHour, setStartDate, setEndDate, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Actividad"
      className="w-[1800px] h-[680px]"
    >
      <form onSubmit={handleSubmit} className="w-full">
        <section className="flex flex-col md:flex-row gap-4">
          {/* 🧾 FORMULARIO */}
          <div className="w-full md:w-[70%]">
            <InputField type="hidden" {...register("nameUnit")} />
            <InputField type="hidden" {...register("conjuntoId")} />

            <InputField
              placeholder="Nombre de la actividad"
              defaultValue={activity}
              className="mt-2"
              {...register("activity")}
              hasError={!!errors.activity}
              errorMessage={errors.activity?.message}
            />

            <TextAreaField
              className="mt-2"
              defaultValue={description}
              rows={8}
              maxLength={450}
              {...register("description")}
              errorMessage={errors.description?.message}
            />

            <Text size="xs" className="text-right text-gray-500">
              Mínimo 10 - Máximo 450 caracteres
            </Text>

            <InputField
              placeholder="Cantidad"
              type="number"
              className="mt-2"
              defaultValue={cuantity}
              {...register("cuantity")}
              hasError={!!errors.cuantity}
              errorMessage={errors.cuantity?.message}
            />

            {/* ⏰ HORAS */}
            <div className="flex gap-2 mt-2">
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={es}
              >
                <TimePicker
                  label="Hora inicio"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setValue(
                      "dateHourStart",
                      date ? date.toTimeString().slice(0, 5) : ""
                    );
                  }}
                  ampm={false}
                  minutesStep={5}
                />

                <TimePicker
                  label="Hora fin"
                  value={endDate}
                  onChange={(date) => {
                    if (date && startDate && date <= startDate) return;

                    setEndDate(date);
                    setValue(
                      "dateHourEnd",
                      date ? date.toTimeString().slice(0, 5) : ""
                    );
                  }}
                  ampm={false}
                  minutesStep={5}
                />
              </LocalizationProvider>
            </div>

            <InputField
              placeholder="Duración"
              type="number"
              className="mt-2"
              {...register("duration")}
              errorMessage={errors.duration?.message}
            />
          </div>

          {/* 📷 IMAGEN */}
          <div className="w-full md:w-[30%] flex flex-col items-center justify-center border-l p-4">
            {!preview && (
              <>
                <IoImages
                  size={120}
                  onClick={handleIconClick}
                  className="cursor-pointer text-gray-400"
                />
                <Text size="xs">Solo JPG / PNG</Text>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {preview && (
              <>
                <Image
                  src={preview}
                  width={300}
                  height={200}
                  alt="Preview"
                  className="rounded-md"
                />
                <Buton
                  colVariant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleIconClick}
                >
                  Cambiar imagen
                </Buton>
              </>
            )}

            {errors.file && (
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>

        {/* 🔘 BOTONES */}
        <div className="flex justify-end gap-2 mt-6">
          <Buton type="button" borderWidth="none" onClick={onClose}>
            Cancelar
          </Buton>
          <Button type="submit" colVariant="warning">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
