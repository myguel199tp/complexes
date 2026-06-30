/* eslint-disable @next/next/no-img-element */
"use client";

import { InputField, Button } from "complexes-next-components";
import { useState } from "react";
import useForm from "./useForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { ImSpinner9 } from "react-icons/im";
import { AlertFlag } from "@/app/components/alertFalg";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdMarkEmailUnread } from "react-icons/md";
import { route } from "@/app/_domain/constants/routes";

export default function ComercioLoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isSubmitting,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.12)]">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/complex.jpg"
              alt="SmartPH"
              onClick={() => router.push(route.complexes)}
              className="
              h-24
              w-auto
              cursor-pointer
              rounded-2xl
              shadow-lg
            "
            />
            <h1 className="mt-5 text-3xl font-bold text-white">Comercio</h1>
            <p className="mt-2 text-center text-sm text-slate-400">
              Inicia sesión en tu cuenta de comercio
            </p>
          </div>

          <AlertFlag />

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              placeholder="Correo electrónico"
              helpText="Correo electrónico"
              prefixElement={<MdMarkEmailUnread size={15} />}
              sizeHelp="sm"
              inputSize="md"
              rounded="md"
              type="email"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
              autoComplete="username"
            />

            <div className="relative">
              <InputField
                placeholder="Contraseña"
                helpText="Contraseña"
                prefixElement={<RiLockPasswordLine size={15} />}
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                hasError={!!errors.password}
                errorMessage={errors.password?.message}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? (
                  <IoEyeOffSharp size={18} />
                ) : (
                  <IoEyeSharp size={18} />
                )}
              </button>
            </div>

            <Button
              colVariant="success"
              size="full"
              rounded="md"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <ImSpinner9 className="animate-spin" />
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="flex justify-center gap-4 mt-6">
            <Link href="/comercio/register" className="text-blue-400 font-bold">
              Registrar mi comercio
            </Link>
          </div>

          <div className="flex justify-center mt-4">
            <Button size="sm" onClick={() => router.push("/complexes")}>
              SmartPH
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
