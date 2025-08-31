"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
} from "complexes-next-components";
import useForm from "./use-form";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import { useCountryCityOptions } from "../register-option";

export default function FormComplex() {
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    setValue,
    formState: { errors },
    onSubmit,
    handleIconClick,
    fileInputRef,
  } = useForm();

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

  return (
    <div className="border-2 p-5 rounded-md mt-3 w-full">
      <div className="w-full flex gap-2 justify-center ">
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex flex-col gap-4 md:!flex-row justify-around w-full">
            <section className="w-full">
              <InputField
                placeholder="nombre administrador(Representante)"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder="apellido administrador(Representante)"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />
              <InputField
                placeholder="Numero de identificación(cedula-pasaporte)"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("numberid")}
                hasError={!!errors.numberid}
                errorMessage={errors.numberid?.message}
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
                }}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />
              <InputField
                placeholder="Celular"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
            </section>
            <section className="w-full">
              <InputField
                placeholder="correo electronico"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  onClick={() => {
                    window.open(route.termsConditions, "_blank");
                  }}
                >
                  términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.termsConditions.message}
                </Text>
              )}
              <div className="w-full mt-4 justify-center items-center border-x-4 border-gray-300 p-2">
                {!preview && (
                  <>
                    <IoImages
                      size={150}
                      onClick={handleIconClick}
                      className="cursor-pointer text-gray-300"
                    />
                    <div className="justify-center items-center">
                      <Text size="sm"> sube tu foto </Text>
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
                  <div className="block">
                    <div className="mt-3">
                      <Image
                        src={preview}
                        width={200}
                        height={200}
                        alt="Vista previa"
                        className="w-full max-w-xs rounded-md border"
                      />
                    </div>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.file.message}
                  </p>
                )}
              </div>
            </section>
          </div>
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            className="mt-4"
            type="submit"
          >
            <Text>Registrarse</Text>
          </Button>
        </form>
      </div>
    </div>
  );
}
