/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Flag,
  InputField,
  Title,
  Button,
  Tabs,
} from "complexes-next-components";
import useForm from "./useForm";
import { useRouter } from "next/navigation";
import { route } from "../_domain/constants/routes";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    {
      label: "",
      children: (
        <>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              placeholder={t("correo")}
              helpText={t("correo")}
              sizeHelp="sm"
              inputSize="full"
              rounded="md"
              type="email"
              {...register("email")}
              hasError={!!errors.email}
              errorMessage={errors.email?.message}
              autoComplete="username"
            />
            <div className="relative">
              <InputField
                placeholder={t("contrasena")}
                helpText={t("contrasena")}
                sizeHelp="sm"
                inputSize="full"
                rounded="md"
                type={showPassword ? "text" : "password"} // 👈 alterna tipo
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
              colVariant="warning"
              size="full"
              rounded="md"
              tKey={t("insert")}
              translate="yes"
              type="submit"
            >
              Iniciar sesión
            </Button>
          </form>
          <Link
            href="/return-password"
            className="text-blue-500 font-bold mt-1
          "
          >
            {t("recuperar")}
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
              {t("register")}
            </Button>
            <Button
              size="sm"
              colVariant="warning"
              onClick={() => {
                router.push(route.registerComplex);
              }}
            >
              {t("inscripcion")}
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
    <div
      className="flex flex-col min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/aptos.png')" }}
    >
      <div className="flex gap-2 m-5 items-center">
        <img
          src="/complex.jpg"
          className="rounded-lg cursor-pointer"
          width={150}
          height={80}
          alt={t("inicio")}
          onClick={() => {
            router.push(route.complexes);
          }}
        />
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg p-6 rounded-lg shadow-md bg-white/50 backdrop-blur-xl border border-white/40">
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
          <Title
            size="md"
            tKey={t("insert")}
            translate="yes"
            className="m-4 text-center"
            font="semi"
            as="h2"
          >
            Iniciar sesión
          </Title>
          <Tabs tabs={tabs} defaultActiveIndex={0} />
        </div>
      </div>
    </div>
  );
}
