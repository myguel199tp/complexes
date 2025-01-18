"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  // Flag,
} from "complexes-next-components";
import Image from "next/image";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Form() {
  const router = useRouter();
  const {
    register,
    setValue,
    formState: { errors },
    // isSuccess,
    onSubmit,
  } = useForm();
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* {isSuccess && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )} */}
      <Title size="md" className="m-4" font="semi" as="h2">
        Crear cuenta
      </Title>
      <div className="w-full flex gap-2 justify-center">
        <div className="w-[50%]">
          <Image
            src="https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?rs=1&pid=ImgDetMain"
            width={600}
            height={800}
            alt="imagen"
          />
        </div>
        <form className="w-[50%]" onSubmit={onSubmit}>
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
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">
              Subir imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue("file", file, { shouldValidate: true });
                }
              }}
            />
            {errors.file && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.file.message}
              </Text>
            )}
          </div>

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
