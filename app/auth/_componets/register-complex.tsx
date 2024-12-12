import React from "react";
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

export default function RegisterComplex() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useComplexForm();
  return (
    <>
      {isSuccess && (
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
        <InputField
          placeholder="Contraseña"
          inputSize="full"
          rounded="md"
          type="password"
          {...register("password")}
          hasError={!!errors.password}
          errorMessage={errors.password?.message}
        />
        <Buton
          colVariant="primary"
          size="full"
          rounded="md"
          borderWidth="semi"
          type="submit"
        >
          <Text>Ingresar</Text>
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
