"use client";
import { Buton, InputField, Text } from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import useForm from "./use-form";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    isSuccess,
  } = useForm();
  const [previews, setPreviews] = useState<string[]>([]);

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
    <form onSubmit={onSubmit}>
      <section className="flex flex-col gap-4 md:!flex-row justify-between">
        <div className="w-full md:!w-[45%]">
          <InputField
            placeholder="Sector o barrio"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("neigborhood")}
            hasError={!!errors.neigborhood}
            errorMessage={errors.neigborhood?.message}
          />
          <InputField
            placeholder="Ciudad"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("city")}
            hasError={!!errors.city}
            errorMessage={errors.city?.message}
          />
          <InputField
            placeholder="País"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("country")}
            hasError={!!errors.country}
            errorMessage={errors.country?.message}
          />
          <InputField
            placeholder="Dirección"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("address")}
            hasError={!!errors.address}
            errorMessage={errors.address?.message}
          />
          <InputField
            placeholder="nombre"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("name")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <InputField
            placeholder="Precio por noche"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("price")}
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />

          <InputField
            placeholder="Cantidad maxima"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("maxGuests")}
            hasError={!!errors.maxGuests}
            errorMessage={errors.maxGuests?.message}
          />
        </div>
        <div className="w-full md:!w-[30%] border-x-4 border-cyan-800 p-2">
          <>
            {previews.length === 0 && (
              <>
                <IoImages
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm">solo archivos png - jpg</Text>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {previews.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 mt-2">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="group w-fit rounded-md overflow-hidden"
                  >
                    <Image
                      src={src}
                      width={200}
                      height={150}
                      alt={`Vista previa ${index}`}
                      className="w-full max-w-xs rounded-md border transition-transform duration-300 group-hover:scale-125"
                    />
                  </div>
                ))}
              </div>
            )}
            {previews.length > 0 && (
              <div className="flex mt-2 gap-4">
                <IoImages
                  size={50}
                  onClick={handleIconClick}
                  className="cursor-pointer"
                />
                <div className="flex justify-center items-center">
                  <Text size="sm">solo archivos png - jpg</Text>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </>
        </div>
        <div className="w-full md:!w-[45%]">
          <InputField
            placeholder="Parqueadero"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("parking")}
            hasError={!!errors.parking}
            errorMessage={errors.parking?.message}
          />

          <InputField
            placeholder="Celular"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("cel")}
            hasError={!!errors.cel}
            errorMessage={errors.cel?.message}
          />
          <div className="flex ml-4 mt-2  mb-4 md:!mb-0">
            <div className="flex items-center justify-center gap-1">
              <input
                type="checkbox"
                {...register("petsAllowed")}
                className="w-6 h-6 bg-gray-200 border-gray-400 rounded-md cursor-pointer"
              />
              Se aceptan mascotas
            </div>
            {errors.petsAllowed && (
              <Text size="sm" colVariant="danger">
                {errors.petsAllowed.message}
              </Text>
            )}
          </div>
          <InputField
            placeholder="Reglas de hogar"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("ruleshome")}
            hasError={!!errors.ruleshome}
            errorMessage={errors.ruleshome?.message}
          />
          <InputField
            placeholder="Descripción o observaciones"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("description")}
            hasError={!!errors.description}
            errorMessage={errors.description?.message}
          />

          <InputField
            placeholder="Promoción"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("promotion")}
            hasError={!!errors.promotion}
            errorMessage={errors.promotion?.message}
          />

          <InputField
            placeholder="Numero de apartamento o casa"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="text"
            {...register("apartment")}
            hasError={!!errors.apartment}
            errorMessage={errors.apartment?.message}
          />

          <InputField
            className="mt-2"
            type="hidden"
            {...register("nameUnit")}
            hasError={!!errors.nameUnit}
            errorMessage={errors.nameUnit?.message}
          />

          <div className="mt-2">
            <Text size="sm">
              Seleccione las fechas en que estara activo y a la vista para que
              la propiedad sea alquilada{" "}
            </Text>
            <div className="flex flex-col md:flex-row mt-2 gap-2">
              <DatePicker
                selected={startDate}
                className="bg-gray-200 p-3 rounded-md"
                onChange={(date: Date | null) => {
                  setStartDate(date);
                  setValue(
                    "startDate",
                    date ? date.toISOString().split("T")[0] : ""
                  );
                }}
                popperClassName="some-custom-class"
                popperPlacement="top-end"
                placeholderText="fecha inicio"
                popperModifiers={[
                  {
                    name: "myModifier",
                    fn(state) {
                      // Do something with the state
                      return state;
                    },
                  },
                ]}
              />
              <DatePicker
                selected={endDate}
                className="bg-gray-200 p-3 rounded-md"
                onChange={(date: Date | null) => {
                  setEndDate(date);
                  setValue(
                    "endDate",
                    date ? date.toISOString().split("T")[0] : ""
                  );
                }}
                popperClassName="some-custom-class"
                popperPlacement="top-end"
                placeholderText="fecha fin"
                popperModifiers={[
                  {
                    name: "myModifier",
                    fn(state) {
                      // Do something with the state
                      return state;
                    },
                  },
                ]}
              />
            </div>
          </div>
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
        <Text>Activar reserva</Text>
      </Buton>
    </form>
  );
}
