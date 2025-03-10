"use client";
import React, { useState } from "react";
import useComplexForm from "../useComplexForm";
import {
  Buton,
  Button,
  Flag,
  InputField,
  Text,
} from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function RegisterComplex() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    showFlag,
    onSubmit,
  } = useComplexForm();
  return (
    <>
      {showFlag && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          placeholder="nombre"
          inputSize="full"
          rounded="md"
          type="text"
          {...register("name")}
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
        />{" "}
        <InputField
          placeholder="nombre unidad"
          inputSize="full"
          rounded="md"
          type="text"
          {...register("nameUnit")}
          hasError={!!errors.nameUnit}
          errorMessage={errors.nameUnit?.message}
        />
        <InputField
          placeholder="Correo electrónico"
          inputSize="full"
          rounded="md"
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
        <Buton
          colVariant="primary"
          size="full"
          rounded="md"
          borderWidth="semi"
          type="submit"
        >
          <Text>IngresarAqui</Text>
        </Buton>
      </form>
      <div className="flex justify-center gap-4 mt-4">
        <Button
          size="sm"
          onClick={() => {
            router.push(route.complexes);
          }}
        >
          Complexes
        </Button>
        <Button
          size="sm"
          onClick={() => {
            router.push(route.registers);
          }}
        >
          Regístrate
        </Button>
      </div>
    </>
  );
}
