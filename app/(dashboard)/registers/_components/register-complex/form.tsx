"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  Flag,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoImages } from "react-icons/io5";

import Image from "next/image";
import Payments from "./payments";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function FormComplex() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    setValue,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();
  const [selectedOption, setSelectedOption] = useState("");

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

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const [showPassword, setShowPassword] = useState(false);

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
      <div className="w-full flex gap-2 justify-center ">
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex flex-col md:!flex-row justify-around">
            <section>
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
                placeholder="apellido"
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
                value={selectedOption}
                options={options}
                inputSize="full"
                rounded="md"
                hasError={!!errors.city}
                {...register("city", {
                  onChange: (e) => setSelectedOption(e.target.value),
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
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  hasError={!!errors.password}
                  errorMessage={errors.password?.message}
                />
                <div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </div>
              </div>
            </section>
            <div className="mt-3">
              <IoImages
                size={100}
                onClick={handleIconClick}
                className="cursor-pointer"
              />
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
                    height={200}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                </div>
              )}
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.file.message}
                </p>
              )}
            </div>
            <section>
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
                placeholder="Barrio o sector"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("neigborhood")}
                hasError={!!errors.neigborhood}
                errorMessage={errors.neigborhood?.message}
              />
              <InputField placeholder="cantidad de casas o apartamentos" />
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
          <Payments />

          <div className="mt-3">
            <Buton
              colVariant="primary"
              size="full"
              rounded="md"
              borderWidth="semi"
              type="submit"
            >
              <Text>Registrarse</Text>
            </Buton>
          </div>
        </form>
      </div>
    </div>
  );
}
