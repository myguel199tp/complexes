"use client";
import React, { useRef, useState } from "react";
import { Buton, Button, InputField, Text } from "complexes-next-components";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";

export default function Form() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row">
          <div className="w-full md:!w-[70%]">
            <InputField
              className="mt-2"
              type="hidden"
              {...register("nameUnit")}
              hasError={!!errors.nameUnit}
              errorMessage={errors.nameUnit?.message}
            />
            <InputField
              className="mt-2"
              type="hidden"
              {...register("conjunto_id")}
              hasError={!!errors.conjunto_id}
              errorMessage={errors.conjunto_id?.message}
            />
            <InputField
              placeholder="Nombre de la actividad"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("activity")}
              hasError={!!errors.activity}
              errorMessage={errors.activity?.message}
            />
            <InputField
              placeholder="Descripción de la actividad"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("description")}
              hasError={!!errors.description}
              errorMessage={errors.description?.message}
            />
            <InputField
              placeholder="Cantidad de residentes en actividad"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("cuantity")}
              hasError={!!errors.cuantity}
              errorMessage={errors.cuantity?.message}
            />
            <div className="flex flex-col md:!flex-row mt-2 gap-1">
              <DatePicker
                className="bg-gray-200 p-3 rounded-md"
                selected={startDate}
                onChange={(date: Date | null) => {
                  setStartDate(date);
                  setValue(
                    "dateHourStart",
                    date ? date.toTimeString().slice(0, 5) : ""
                  );
                }}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="HH:mm"
                timeCaption="Time"
                placeholderText="Seleccione hora de inicio"
              />

              <DatePicker
                className="bg-gray-200 p-3 rounded-md"
                selected={endDate}
                onChange={(date: Date | null) => {
                  if (date && startDate && date <= startDate) {
                    alert(
                      "La hora de cierre debe ser posterior a la hora de inicio"
                    );
                    return;
                  }
                  setEndDate(date);
                  setValue(
                    "dateHourEnd",
                    date ? date.toTimeString().slice(0, 5) : ""
                  );
                }}
                showTimeSelect
                showTimeSelectOnly
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="HH:mm"
                timeCaption="Time"
                placeholderText="Seleccione hora de cierre"
              />

              <div className="flex md:!justify-center md:!items-center ml-4 mb-4 md:!mb-0">
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="checkbox"
                    {...register("status")}
                    className="w-6 h-6 bg-gray-200 border-gray-400 rounded-md cursor-pointer"
                  />
                  Activar
                </div>
                {errors.status && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </Text>
                )}
              </div>
            </div>
          </div>
          <div className="w-full md:!w-[30%] ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
            {!preview && (
              <>
                <IoImages
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer text-cyan-800"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm"> solo archivos png - jpg </Text>
                </div>
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
              <div className="mt-3">
                <Image
                  src={preview}
                  width={200}
                  height={130}
                  alt="Vista previa"
                  className="w-full max-w-xs rounded-md border"
                />
                <Button
                  className="p-2"
                  colVariant="primary"
                  size="sm"
                  onClick={handleIconClick}
                >
                  Cargar otra
                </Button>
              </div>
            )}
            {errors.file && (
              <Text size="xs" className="text-red-500 text-sm mt-1">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>
        <Buton
          colVariant="primary"
          size="full"
          rounded="md"
          borderWidth="semi"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar Actividad</Text>
        </Buton>
      </form>
    </div>
  );
}
