"use client";
import {
  Buton,
  Flag,
  InputField,
  Title,
  Text,
} from "complexes-next-components";
import useForm from "./useForm";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();

  return (
    <div>
      {isSuccess && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )}
      <Title size="md" className="m-4" font="semi" as="h2">
        Ininciar Sesion
      </Title>
      <div className="w-full flex gap-2 justify-center">
        <form className="w-[50%]" onSubmit={handleSubmit(onSubmit)}>
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
            <Buton
              colVariant="primary"
              size="full"
              rounded="md"
              borderWidth="semi"
              type="submit"
            >
              <Text>Ingresar</Text>
            </Buton>
          </div>
        </form>
      </div>
    </div>
  );
}
