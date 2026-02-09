"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { activateTempPassword } from "@/app/auth/services/active-temp";
import { Title, Text } from "complexes-next-components";
import { useState } from "react";
import { route } from "@/app/_domain/constants/routes";

const schema = yup.object({
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .matches(/\d/, "Debe incluir al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo especial"),
});

type FormData = yup.InferType<typeof schema>;

export default function ActivateTempPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // valida mientras escribe
  });

  const onSubmit = async (data: FormData) => {
    if (!userId) {
      setServerError("El enlace no es válido o ha expirado.");
      return;
    }

    setServerError("");

    try {
      await activateTempPassword({
        userId,
        newPassword: data.password,
      });
      router.push(route.ensemble);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError(
          "Ocurrió un error activando tu contraseña. Intenta de nuevo.",
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fade-in">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <Title size="sm" font="bold">
            Activa tu contraseña
          </Title>
          <Text size="sm">
            Ingresa una nueva contraseña segura para activar tu cuenta.
          </Text>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nueva contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="Ejemplo: MiClaveSegura123*"
              {...register("password")}
              className={`w-full px-4 py-2 rounded-lg border transition-all outline-none
                ${
                  errors.password
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
            />

            <Text size="xs" className="mt-1 text-gray-500">
              Debe tener al menos 8 caracteres, incluir mayúsculas, números y un
              símbolo especial.
            </Text>

            {errors.password && (
              <Text size="xs" colVariant="danger" className="mt-1">
                {errors.password.message}
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
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all shadow-sm
              ${
                isSubmitting || !isValid
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              }`}
          >
            {isSubmitting ? "Activando contraseña..." : "Activar contraseña"}
          </button>
        </form>

        {/* Pie */}
        <Text size="sm" className="mt-4 text-center">
          Una vez activada, podrás iniciar sesión con tu nueva contraseña.
        </Text>
      </div>
    </div>
  );
}
