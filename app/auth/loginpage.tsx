/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  InputField,
  Button,
  Tabs,
  Text,
  Title,
} from "complexes-next-components";
import { useEffect, useState } from "react";
import useForm from "./useForm";
import { useRouter, useSearchParams } from "next/navigation";
import { route } from "../_domain/constants/routes";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { ImSpinner9 } from "react-icons/im";
import { useLanguage } from "../hooks/useLanguage";
import { AlertFlag } from "../components/alertFalg";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdMarkEmailUnread } from "react-icons/md";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { t } = useTranslation();
  const { language } = useLanguage();

  const emailFromUrl = searchParams.get("email");
  const passwordFromUrl = searchParams.get("password");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [autoLoginDone, setAutoLoginDone] = useState(false);

  /**
   * 🔥 Auto fill + auto login desde URL
   */
  useEffect(() => {
    if (!emailFromUrl || !passwordFromUrl) return;
    if (autoLoginDone) return;

    setAutoLoginDone(true);

    setValue("email", emailFromUrl);
    setValue("password", passwordFromUrl);

    // evita race condition de react-hook-form
    queueMicrotask(() => {
      handleSubmit(onSubmit)();
    });
  }, [emailFromUrl, passwordFromUrl]);

  const tabs = [
    {
      label: "",
      children: (
        <div key={language}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              placeholder={t("correo")}
              helpText={t("correo")}
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
                placeholder={t("contrasena")}
                helpText={t("contrasena")}
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

          <Link
            href="/return-password"
            className="text-blue-500 font-bold mt-2"
          >
            {t("recuperar")}
          </Link>
        </div>
      ),
      colVariant: "default",
      size: "sm",
      background: "default",
      padding: "sm",
      rounded: "lg",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Glow cyan */}
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />

      {/* Glow azul */}
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px]" />

      {/* Imagen decorativa */}
      <img
        src="/aptos.png"
        alt=""
        className="
        hidden lg:block
        absolute
        right-0
        bottom-0
        h-[90vh]
        object-contain
        opacity-20
        pointer-events-none
        select-none
      "
      />

      {/* Contenido */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div
          className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          p-8
          backdrop-blur-2xl
          shadow-[0_0_80px_rgba(34,211,238,0.12)]
        "
        >
          {/* Logo */}
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

            <Title as="h1" size="sm" font="bold" colVariant="on" className="mt-5">SmartPH</Title>

            <Text size="sm" className="mt-2 text-center text-slate-400">
              Gestión inteligente de conjuntos residenciales
            </Text>
          </div>

          <AlertFlag />

          <Tabs tabs={tabs} defaultActiveIndex={0} />
        </div>
      </div>
    </div>
  );
}
