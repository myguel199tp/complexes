"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Buton,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";

export default function FormComplex() {
  const router = useRouter();
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedplaque, setSelectedPlaque] = useState("");
  const [selectedNumberId, setSelectedNumberId] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    handleIconClick,
    fileInputRef,
  } = useForm({
    role: selectedRol,
    apartment: selectedApartment,
    plaque: selectedplaque,
    numberid: selectedNumberId,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const optionsRol = [
    { value: "owner", label: "Dueño de apartamento" },
    { value: "employee", label: "Portero" },
  ];

  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();

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
    <div className="w-full p-2">
      <div className="w-full flex gap-2 justify-center shadow-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center w-full p-4"
        >
          <section className="flex flex-col gap-4 md:flex-row justify-between w-full">
            {/* Columna izquierda */}
            <div className="w-full md:w-[45%]">
              <InputField
                placeholder="Nombre"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder="Apellido"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
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
              <InputField
                placeholder="Correo electrónico"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <InputField
                placeholder="Número de cédula"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="number"
                {...register("numberid", {
                  onChange: (e) => setSelectedNumberId(e.target.value),
                })}
                hasError={!!errors.numberid}
                errorMessage={errors.numberid?.message}
              />
            </div>

            {/* Columna imagen */}
            <div className="w-full md:w-[30%] border-x-4 border-cyan-800 p-2 flex flex-col items-center">
              {!preview && (
                <>
                  <IoImages
                    size={150}
                    onClick={handleIconClick}
                    className="cursor-pointer text-cyan-800"
                  />
                  <Text size="sm" className="text-cyan-800">
                    Solo archivos PNG - JPG
                  </Text>
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
                    width={300}
                    height={130}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                  <Button
                    className="p-2 mt-2"
                    colVariant="primary"
                    size="sm"
                    onClick={handleIconClick}
                  >
                    Cargar otra
                  </Button>
                </div>
              )}

              {errors.file && (
                <Text size="xs" colVariant="danger">
                  {errors.file.message}
                </Text>
              )}
            </div>

            {/* Columna derecha */}
            <div className="w-full md:w-[45%]">
              {/* Campos ocultos */}
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
                placeholder="Número vivienda"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("apartment", {
                  onChange: (e) => setSelectedApartment(e.target.value),
                })}
                hasError={!!errors.apartment}
                errorMessage={errors.apartment?.message}
              />
              <SelectField
                className="mt-2"
                id="role"
                defaultOption="Tipo de usuario"
                value={selectedRol}
                options={optionsRol}
                inputSize="full"
                rounded="md"
                hasError={!!errors.role}
                {...register("role", {
                  onChange: (e) => setSelectedRol(e.target.value),
                })}
              />
              <InputField
                placeholder="Placa de vehiculo"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("plaque", {
                  onChange: (e) => setSelectedPlaque(e.target.value),
                })}
                hasError={!!errors.plaque}
                errorMessage={errors.plaque?.message}
              />
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  type="button"
                  onClick={() => {
                    router.push(route.termsConditions);
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <Text colVariant="danger" size="xs">
                  {errors.termsConditions.message}
                </Text>
              )}
            </div>
          </section>

          <Buton
            type="submit"
            colVariant="primary"
            size="full"
            className="mt-4"
          >
            <Text>Registrarse est</Text>
          </Buton>
        </form>
      </div>
    </div>
  );
}
