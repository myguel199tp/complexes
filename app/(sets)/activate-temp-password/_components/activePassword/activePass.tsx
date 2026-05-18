"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { activateTempPassword } from "@/app/auth/services/active-temp";
import { Title, Text } from "complexes-next-components";
import { useState } from "react";
import { route } from "@/app/_domain/constants/routes";
import { setCookie } from "nookies";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ShieldCheck, LockKeyhole, CheckCircle2 } from "lucide-react";

const schema = yup.object({
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .matches(/\d/, "Debe incluir al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo especial"),

  confirmPassword: yup
    .string()
    .required("Debes confirmar la contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

type FormData = yup.InferType<typeof schema>;

export default function ActivateTempPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: FormData) => {
    if (!userId) {
      setServerError("El enlace no es válido o ha expirado.");
      return;
    }

    setServerError("");

    try {
      const res = await activateTempPassword({
        userId,
        newPassword: data.password,
      });

      setCookie(null, "accessToken", res.accessToken, {
        path: "/",
        maxAge: 15 * 60,
        sameSite: "lax",
      });

      setCookie(null, "refreshToken", res.refreshToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });

      setCookie(null, "sessionId", res.sessionId, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      setTimeout(() => {
        router.push(route.ensemble);
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Ocurrió un error activando tu contraseña.");
      }
    }
  };

  const passwordRules = [
    {
      label: "Mínimo 8 caracteres",
      valid: hasMinLength,
    },
    {
      label: "Una letra mayúscula",
      valid: hasUpperCase,
    },
    {
      label: "Un número",
      valid: hasNumber,
    },
    {
      label: "Un símbolo especial",
      valid: hasSpecialChar,
    },
  ];

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050816]
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-150px] left-[-120px] w-[320px] h-[320px] bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-140px] right-[-100px] w-[320px] h-[320px] bg-cyan-500/20 blur-3xl rounded-full" />

      {/* CARD */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-lg
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.05]
          backdrop-blur-2xl
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          overflow-hidden
        "
      >
        {/* TOP BAR */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />

        <div className="p-6 sm:p-10">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div
              className="
                w-20
                h-20
                mx-auto
                rounded-3xl
                bg-emerald-500/10
                border
                border-emerald-500/20
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <LockKeyhole className="w-10 h-10 text-emerald-400" />
            </div>

            <Title size="sm" font="bold" className="text-white">
              Activa tu contraseña
            </Title>

            <Text className="text-gray-400 mt-3">
              Crea una contraseña segura para acceder a tu cuenta.
            </Text>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Nueva contraseña
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className={`
                    w-full
                    rounded-2xl
                    border
                    bg-white/[0.04]
                    backdrop-blur-xl
                    px-5
                    py-4
                    pr-12
                    text-white
                    placeholder:text-gray-500
                    outline-none
                    transition-all
                    ${
                      errors.password
                        ? "border-red-500/40 focus:border-red-500"
                        : "border-white/10 focus:border-emerald-400/60"
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-white
                    transition-colors
                  "
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* PASSWORD RULES */}
              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                "
              >
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      py-2
                      text-sm
                      border
                      transition-all
                      ${
                        rule.valid
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-white/[0.03] border-white/10 text-gray-400"
                      }
                    `}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {rule.label}
                  </div>
                ))}
              </div>

              {errors.password && (
                <Text size="xs" className="mt-2 text-red-400">
                  {errors.password.message}
                </Text>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirmar contraseña
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`
                    w-full
                    rounded-2xl
                    border
                    bg-white/[0.04]
                    backdrop-blur-xl
                    px-5
                    py-4
                    pr-12
                    text-white
                    placeholder:text-gray-500
                    outline-none
                    transition-all
                    ${
                      errors.confirmPassword
                        ? "border-red-500/40 focus:border-red-500"
                        : "border-white/10 focus:border-emerald-400/60"
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-white
                    transition-colors
                  "
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <Text size="xs" className="mt-2 text-red-400">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </div>

            {/* SECURITY INFO */}
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-500/10
                bg-emerald-500/5
                px-4
                py-3
              "
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />

              <Text className="text-sm text-emerald-200">
                Tu contraseña se almacenará de forma segura.
              </Text>
            </div>

            {/* SERVER ERROR */}
            {serverError && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-3
                "
              >
                <Text className="text-sm text-red-300">{serverError}</Text>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`
                w-full
                rounded-2xl
                py-4
                font-semibold
                text-white
                transition-all
                duration-300
                shadow-lg
                ${
                  isSubmitting || !isValid
                    ? "bg-emerald-500/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-[1.01] active:scale-[0.99]"
                }
              `}
            >
              {isSubmitting ? "Activando..." : "Activar contraseña"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 text-center">
            <Text className="text-gray-500 text-sm">
              Una vez activada, podrás iniciar sesión con tu nueva contraseña.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
