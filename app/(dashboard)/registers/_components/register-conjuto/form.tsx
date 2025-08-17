"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoImages } from "react-icons/io5";
import useForm from "./use-form";

import Image from "next/image";
import { useRegisterStore } from "../store/registerStore";
import { useCountryCityOptions } from "../register-option";

export default function FormConjunto() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
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

  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();

  const {
    setCityConjunto,
    setCountryConjunto,
    setNameConjunto,
    setNitConjunto,
    setAddressConjunto,
    setNeigBoorConjunto,
  } = useRegisterStore();

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row">
          <div className="w-full md:!w-[70%]">
            <InputField
              placeholder="Nombre de conjunto"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("name")}
              onChange={(e) => {
                setValue("name", e.target.value, { shouldValidate: true });
                setNameConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <InputField
              placeholder="Nit de conjunto"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("nit")}
              onChange={(e) => {
                setValue("nit", e.target.value, { shouldValidate: true });
                setNitConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              hasError={!!errors.nit}
              errorMessage={errors.nit?.message}
            />

            <SelectField
              className="mt-2"
              defaultOption="Pais"
              id="ofert"
              options={countryOptions}
              inputSize="lg"
              rounded="md"
              {...register("country")}
              onChange={(e) => {
                setSelectedCountryId(e.target.value || null);
                setValue("country", e.target.value, { shouldValidate: true });
                setCountryConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              hasError={!!errors.country}
              errorMessage={errors.country?.message}
            />

            {/* Ciudad */}
            <SelectField
              className="mt-2"
              defaultOption="Ciudad"
              id="ofert"
              options={cityOptions}
              inputSize="lg"
              rounded="md"
              {...register("city")}
              onChange={(e) => {
                setValue("city", e.target?.value || "", {
                  shouldValidate: true,
                });
                setCityConjunto(e.target?.value || "");
              }}
              hasError={!!errors.city}
              errorMessage={errors.city?.message}
            />

            <InputField
              placeholder="Barrio"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("neighborhood")}
              onChange={(e) => {
                setValue("neighborhood", e.target.value, {
                  shouldValidate: true,
                });
                setNeigBoorConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              hasError={!!errors.neighborhood}
              errorMessage={errors.neighborhood?.message}
            />

            <InputField
              placeholder="Direccion"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("address")}
              onChange={(e) => {
                setValue("address", e.target.value, { shouldValidate: true });
                setAddressConjunto(e.target.value); // Aquí actualizas Zustand
              }}
              hasError={!!errors.address}
              errorMessage={errors.address?.message}
            />
            {/* <InputField
              placeholder="Cantidad"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="number"
              {...register("quantityapt", { valueAsNumber: true })}
              hasError={!!errors.quantityapt}
              errorMessage={errors.quantityapt?.message}
            /> */}
            <InputField
              placeholder="Celular"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("cellphone")}
              hasError={!!errors.cellphone}
              errorMessage={errors.cellphone?.message}
            />
            {/* <InputField
              placeholder="Precio"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="number"
              {...register("prices", { valueAsNumber: true })}
              hasError={!!errors.prices}
              errorMessage={errors.prices?.message}
            /> */}
          </div>
          <div className="w-full md:!w-[30%] ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
            {!preview && (
              <>
                <IoImages
                  size={150}
                  onClick={handleIconClick}
                  className="cursor-pointer text-cyan-800 "
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
        >
          <Text>Agregar Conjunto</Text>
        </Buton>
      </form>
    </div>
  );
}
