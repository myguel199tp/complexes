"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  Flag,
  Button,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Payments from "./payments";
import { PiKeyReturnFill } from "react-icons/pi";

export default function FormComplex() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  // const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    setValue,
    formState: { errors },
    isSuccess,
    onSubmit,
    formsvalid,
    setFormsvalid,
    handleIconClick,
    fileInputRef,
  } = useForm();

  // const handleIconClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // };

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

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  return (
    <div>
      {isSuccess && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )}
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Propiedad
      </Title>
      <div className="w-full flex justify-start bg-cyan-800 shadow-lg opacity-80 h-10 rounded-md">
        {formsvalid.toogle && (
          <div className="flex items-center w-12 justify-center">
            <PiKeyReturnFill
              className="text-white cursor-pointer"
              size={30}
              onClick={() =>
                setFormsvalid((prev) => ({
                  ...prev,
                  toogle: !prev.toogle,
                }))
              }
            />
          </div>
        )}
      </div>
      <div className="w-full flex gap-2 justify-center ">
        <form onSubmit={onSubmit} className="w-full">
          {!formsvalid.toogle && (
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
                <SelectField
                  className="mt-2"
                  id="city"
                  defaultOption="Ciudad"
                  value={formsvalid.selectedOption}
                  options={options}
                  inputSize="full"
                  rounded="md"
                  hasError={!!errors.city}
                  {...register("city", {
                    onChange: (e) =>
                      setFormsvalid((prev) => ({
                        ...prev,
                        selectedOption: e.target.value,
                      })),
                  })}
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
                  placeholder="correo electronico"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="email"
                  {...register("email")}
                  hasError={!!errors.email}
                  errorMessage={errors.email?.message}
                />
                <div className="relative mt-2">
                  <InputField
                    placeholder="contraseña"
                    inputSize="full"
                    rounded="md"
                    type={formsvalid.showPassword ? "text" : "password"}
                    {...register("password")}
                    hasError={!!errors.password}
                    errorMessage={errors.password?.message}
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() =>
                      setFormsvalid((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                  >
                    {formsvalid.showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </div>
                </div>
              </section>
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
              <section className="w-full md:!w-[35%]">
                <InputField
                  placeholder="nombre unidad"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("nameUnit")}
                  hasError={!!errors.nameUnit}
                  errorMessage={errors.nameUnit?.message}
                />
                <InputField
                  placeholder="Nit de la únidad"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("nit")}
                  hasError={!!errors.nit}
                  errorMessage={errors.nit?.message}
                />
                <InputField
                  placeholder="Barrio o sector"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("neigborhood")}
                  hasError={!!errors.neigborhood}
                  errorMessage={errors.neigborhood?.message}
                />
                <InputField
                  placeholder="dirección"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("address")}
                  hasError={!!errors.address}
                  errorMessage={errors.address?.message}
                />
                <InputField
                  placeholder="pais"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("country")}
                  hasError={!!errors.country}
                  errorMessage={errors.country?.message}
                />
                <div className="flex items-center mt-3 gap-2">
                  <input type="checkbox" {...register("termsConditions")} />
                  <button
                    onClick={() => {
                      router.push(route.termsConditions);
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
              </section>
            </div>
          )}

          {formsvalid.toogle && <Payments />}
          {!formsvalid.toogle && (
            <Buton
              colVariant="primary"
              size="full"
              rounded="md"
              borderWidth="semi"
              className="mt-4"
              onClick={() =>
                setFormsvalid((prev) => ({
                  ...prev,
                  toogle: !prev.toogle,
                }))
              }
            >
              <Text>Siguiente</Text>
            </Buton>
          )}

          {formsvalid.toogle && (
            <Buton
              colVariant="primary"
              size="full"
              rounded="md"
              borderWidth="semi"
              className="mt-4"
              type="submit"
            >
              <Text>Registrarse aca</Text>
            </Buton>
          )}
        </form>
      </div>
    </div>
  );
}
