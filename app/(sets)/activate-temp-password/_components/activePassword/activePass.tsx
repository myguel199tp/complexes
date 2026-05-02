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

  // 🔥 estado para password en tiempo real
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // ✅ validaciones visuales
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
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });

      setCookie(null, "refreshToken", res.refreshToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* HEADER */}
        <div className="text-center mb-6">
          <Title size="sm" font="bold">
            Establece tu contraseña de acceso
          </Title>
          <Text size="sm">
            Esta será la contraseña que usarás para ingresar a tu cuenta.
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ejemplo: MiClaveSegura123*"
                {...register("password")}
                onChange={(e) => setPasswordValue(e.target.value)}
                className={`w-full px-4 py-2 pr-10 rounded-lg border transition-all outline-none
                ${
                  errors.password
                    ? "border-red-400"
                    : "border-gray-300 focus:border-indigo-500"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* 🔥 CHECKLIST DINÁMICO */}
            <div className="mt-2 space-y-1 text-xs">
              <p className={hasMinLength ? "text-green-600" : "text-gray-500"}>
                • Mínimo 8 caracteres
              </p>

              <p className={hasUpperCase ? "text-green-600" : "text-gray-500"}>
                • Al menos una mayúscula
              </p>

              <p className={hasNumber ? "text-green-600" : "text-gray-500"}>
                • Al menos un número
              </p>

              <p
                className={hasSpecialChar ? "text-green-600" : "text-gray-500"}
              >
                • Al menos un símbolo especial
              </p>
            </div>

            {errors.password && (
              <Text size="xs" colVariant="danger" className="mt-1">
                {errors.password.message}
              </Text>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                {...register("confirmPassword")}
                className={`w-full px-4 py-2 pr-10 rounded-lg border transition-all outline-none
                ${
                  errors.confirmPassword
                    ? "border-red-400"
                    : "border-gray-300 focus:border-indigo-500"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {errors.confirmPassword && (
              <Text size="xs" colVariant="danger" className="mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </div>

          {serverError && (
            <Text size="xs" colVariant="danger">
              {serverError}
            </Text>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-all
            ${
              isSubmitting || !isValid
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Activando..." : "Activar contraseña"}
          </button>
        </form>

        <Text size="sm" className="mt-4 text-center">
          Una vez activada, podrás iniciar sesión con tu nueva contraseña.
        </Text>
      </div>
    </div>
  );
}
