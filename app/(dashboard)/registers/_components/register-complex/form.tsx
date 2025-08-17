"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Button,
  Title,
} from "complexes-next-components";
import useForm from "./use-form";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import { useRegisterStore } from "../store/registerStore";
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

  const { prices } = useRegisterStore();

  return (
    <div>
      <div className="w-full flex gap-2 justify-center ">
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex flex-col gap-4 md:!flex-row justify-around w-full">
            <section className="w-full md:!w-[35%]">
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
              />{" "}
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
              <div className="w-full mt-4 justify-center items-center border-x-4 border-cyan-800 p-2">
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
            <section className="w-full md:!w-[35%]">
              <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                  <Title className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Realiza tu pago
                  </Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Juan Pérez"
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="correo@ejemplo.com"
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Monto (COP)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder={String(prices)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Pagar con Woompi
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <Buton
            colVariant="primary"
            size="full"
            rounded="md"
            borderWidth="semi"
            className="mt-4"
            type="submit"
          >
            <Text>Registrarse ee </Text>
          </Buton>
        </form>
      </div>
    </div>
  );
}
