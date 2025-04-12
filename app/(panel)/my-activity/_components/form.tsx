"use client";
import React, { useRef, useState } from "react";
import { Buton, InputField, Text } from "complexes-next-components";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import useForm from "./use-form";

export default function Form() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    isSuccess,
  } = useForm();

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setValue("files", files, { shouldValidate: true });
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
    } else {
      setPreviews([]);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
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
            <>
              <IoImages
                size={150}
                onClick={handleIconClick}
                className="cursor-pointer"
              />
              <div className="flex justify-center items-center">
                <Text size="sm"> solo archivos png - jpg </Text>
              </div>
            </>

            <input
              type="file"
              accept="image/*"
              multiple // 👈 permite múltiples archivos
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {previews.map((src, index) => (
              <Image
                key={index}
                src={src}
                width={200}
                height={130}
                alt={`Vista previa ${index}`}
                className="w-full max-w-xs rounded-md border mb-2"
              />
            ))}
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
