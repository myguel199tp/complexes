"use client";

import { InputField, Button, Title, Avatar } from "complexes-next-components";
import useForm from "./use-form";
import Link from "next/link";
import { ImSpinner9 } from "react-icons/im";
import { AlertFlag } from "@/app/components/alertFalg";

export default function ComercioRegisterForm() {
  const {
    register,
    formState: { errors },
    onSubmit,
    isSubmitting,
  } = useForm();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-10">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.12)]">
          <div className="flex justify-between">
            <div className="flex flex-col items-center mb-8">
              <Title as="h1" size="lg" colVariant="on" font="semi">
                Registra tu comercio
              </Title>
              <p className="mt-2 text-center text-sm text-slate-400">
                Crea tu cuenta de comercio independiente de SmartPH
              </p>
            </div>
            <div>
              <Avatar
                src="/icon.png"
                alt={"SmarPH"}
                size="xxl"
                border="thick"
                shape="square"
              />
            </div>
          </div>

          <AlertFlag />

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                placeholder="Nombre del negocio"
                helpText="Nombre del negocio"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("businessName")}
                hasError={!!errors.businessName}
                errorMessage={errors.businessName?.message}
              />

              <InputField
                placeholder="Nombre del propietario"
                helpText="Nombre del propietario"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("ownerName")}
                hasError={!!errors.ownerName}
                errorMessage={errors.ownerName?.message}
              />

              <InputField
                placeholder="Correo electrónico"
                helpText="Correo electrónico"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
                autoComplete="username"
              />

              <InputField
                placeholder="Contraseña"
                helpText="Contraseña"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="password"
                {...register("password")}
                hasError={!!errors.password}
                errorMessage={errors.password?.message}
                autoComplete="new-password"
              />

              <InputField
                placeholder="Teléfono"
                helpText="Teléfono"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />

              <InputField
                placeholder="Indicativo (opcional)"
                helpText="Indicativo"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("indicative")}
                hasError={!!errors.indicative}
                errorMessage={errors.indicative?.message}
              />

              <InputField
                placeholder="NIT / RNC (opcional)"
                helpText="NIT / RNC"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("taxId")}
                hasError={!!errors.taxId}
                errorMessage={errors.taxId?.message}
              />

              <InputField
                placeholder="Ciudad (opcional)"
                helpText="Ciudad"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("city")}
                hasError={!!errors.city}
                errorMessage={errors.city?.message}
              />

              <InputField
                placeholder="País (opcional)"
                helpText="País"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("country")}
                hasError={!!errors.country}
                errorMessage={errors.country?.message}
              />

              <InputField
                placeholder="Dirección (opcional)"
                helpText="Dirección"
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type="text"
                {...register("address")}
                hasError={!!errors.address}
                errorMessage={errors.address?.message}
              />
            </div>

            <InputField
              placeholder="Descripción del negocio (opcional)"
              helpText="Descripción"
              sizeHelp="sm"
              inputSize="md"
              rounded="md"
              type="text"
              {...register("description")}
              hasError={!!errors.description}
              errorMessage={errors.description?.message}
            />

            <Button
              colVariant="success"
              size="full"
              rounded="md"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <ImSpinner9 className="animate-spin" />
                </span>
              ) : (
                "Registrar comercio"
              )}
            </Button>
          </form>

          <div className="flex justify-center mt-6">
            <Link href="/comercio/login" className="text-blue-400 font-bold">
              Ya tengo una cuenta de comercio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
