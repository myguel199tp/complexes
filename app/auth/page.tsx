"use client";

import {
  Flag,
  InputField,
  Title,
  Text,
  Button,
  Tabs,
} from "complexes-next-components";
import useForm from "./useForm";
import { useRouter } from "next/navigation";
import { route } from "../_domain/constants/routes";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();

  const tabs = [
    {
      label: "inicio",
      children: (
        <>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              placeholder="Correo electrónico"
              inputSize="full"
              rounded="md"
              type="email"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
              autoComplete="username"
            />
            <InputField
              placeholder="Contraseña"
              inputSize="full"
              rounded="md"
              type="password"
              {...register("password")}
              hasError={!!errors.password}
              errorMessage={errors.password?.message}
              autoComplete="current-password" // ✅ Correcto
            />
            <Button colVariant="warning" size="full" rounded="md" type="submit">
              <Text>Ingresar</Text>
            </Button>
          </form>
          <Link
            href="/return-password"
            className="text-blue-500 font-bold mt-1
          "
          >
            Olvide mi contraseña
          </Link>
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
              colVariant="warning"
              onClick={() => {
                router.push(route.registers);
              }}
            >
              Regístrate
            </Button>
            <Button
              size="sm"
              colVariant="warning"
              onClick={() => {
                router.push(route.registerComplex);
              }}
            >
              Registrar conjunto
            </Button>
          </div>
        </>
      ),
      colVariant: "default",
      size: "sm",
      background: "default",
      padding: "sm",
      rounded: "lg",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
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
        <Tabs tabs={tabs} defaultActiveIndex={0} />
      </div>
    </div>
  );
}
