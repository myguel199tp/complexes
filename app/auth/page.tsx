"use client";

import {
  Buton,
  Flag,
  InputField,
  Title,
  Text,
  Button,
} from "complexes-next-components";
import useForm from "./useForm";
import { useRouter } from "next/navigation";
import { route } from "../_domain/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        {isSuccess && (
          <Flag
            colVariant="success"
            background="success"
            size="sm"
            rounded="lg"
          >
            ¡Operación exitosa!
          </Flag>
        )}
        <Title size="md" className="m-4 text-center" font="semi" as="h2">
          Iniciar Sesión
        </Title>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
      </div>
    </div>
  );
}
