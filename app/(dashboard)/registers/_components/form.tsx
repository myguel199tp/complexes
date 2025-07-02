"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  Button,
  // Flag,
} from "complexes-next-components";
import Image from "next/image";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoImages } from "react-icons/io5";

export default function Form() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    setValue,
    formState: { errors },
    // isSuccess,
    onSubmit,
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
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Title size="md" className="m-4" font="semi" as="h2">
        Crear cuenta
      </Title>
      <div className="w-full flex justify-start bg-cyan-800 shadow-lg opacity-80 h-10 rounded-md"></div>
      <div className="w-full flex gap-2 justify-center mt-2">
        <div className="w-[50%] hidden md:!block">
          <Image
            src="https://www.gbdarchitects.com/wp-content/uploads/2013/09/Kiln-Apartments-1.jpg"
            width={600}
            height={800}
            alt="imagen"
          />
        </div>
        <form className="w-full md:!w-[50%]" onSubmit={onSubmit}>
          <section className="flex flex-col md:!flex-row w-full gap-4">
            <div className="w-full md:!w-[50%]">
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
            </div>
            <div className="w-full md:!w-[50%]">
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
                  type={showPassword ? "text" : "password"} // Alternar tipo
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
            </div>
          </section>
          <section className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="w-full md:!w-[50%] ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
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
            <div className="w-50%">
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
            </div>
          </section>
          <Buton
            colVariant="primary"
            size="full"
            rounded="md"
            borderWidth="semi"
            type="submit"
            className="mt-2"
          >
            <Text>Registrarse</Text>
          </Buton>
        </form>
      </div>
    </div>
  );
}
