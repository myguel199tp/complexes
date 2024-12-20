"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  Flag,
} from "complexes-next-components";
import Image from "next/image";
import useForm from "./use-form";

export default function Form() {
  const {
    register,
    setValue,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();
  const [selectedOption, setSelectedOption] = useState("");

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
          <InputField
            placeholder="contraseña"
            inputSize="full"
            rounded="md"
            className="mt-2"
            type="password"
            {...register("password")}
            hasError={!!errors.password}
            errorMessage={errors.password?.message}
          />
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
              <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
            )}
          </div>

          <div className="flex items-center mt-3 gap-2">
            <input type="checkbox" {...register("termsConditions")} />
            <Text as="a" size="xs">
              Acepto los términos y condiciones
            </Text>
          </div>
          {errors.termsConditions && (
            <p className="text-red-500 text-sm mt-1">
              {errors.termsConditions.message}
            </p>
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
