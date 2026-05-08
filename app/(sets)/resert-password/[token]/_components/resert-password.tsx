"use client";

import React, { useMemo, useState } from "react";
import { InputField, Button, Text } from "complexes-next-components";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { useResetPasswordMutation } from "./use-reset-mutation";
import { useParams } from "next/navigation";

import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export default function ResetPassword() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const { mutate, isPending } = useResetPasswordMutation();

  // VALIDATIONS
  const validations = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      upperCase: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      specialChar: /[^A-Za-z0-9]/.test(newPassword),
      passwordsMatch:
        newPassword.length > 0 &&
        confirmPassword.length > 0 &&
        newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const allValid =
    validations.minLength &&
    validations.upperCase &&
    validations.number &&
    validations.specialChar &&
    validations.passwordsMatch;

  const passwordRules = [
    {
      label: "Mínimo 8 caracteres",
      valid: validations.minLength,
    },
    {
      label: "Una letra mayúscula",
      valid: validations.upperCase,
    },
    {
      label: "Un número",
      valid: validations.number,
    },
    {
      label: "Un símbolo especial",
      valid: validations.specialChar,
    },
    {
      label: "Las contraseñas coinciden",
      valid: validations.passwordsMatch,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("El enlace no es válido.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!allValid) {
      setError("La contraseña no cumple los requisitos.");
      return;
    }

    setError("");

    mutate({
      token,
      newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* PASSWORD */}
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          p-4
        "
      >
        <Text className="text-gray-300 text-sm mb-3">Nueva contraseña</Text>

        <div className="relative">
          <InputField
            placeholder="••••••••"
            inputSize="full"
            rounded="md"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="
              pr-12
              bg-transparent
              border-white/10
              text-white
              placeholder:text-gray-500
            "
          />

          <button
            type="button"
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-white
              transition-colors
            "
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible className="w-5 h-5" />
            ) : (
              <AiOutlineEye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* RULES */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {passwordRules.map((rule) => (
            <div
              key={rule.label}
              className={`
                flex
                items-center
                gap-2
                rounded-xl
                border
                px-3
                py-2
                text-xs
                transition-all
                ${
                  rule.valid
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/[0.03] text-gray-400"
                }
              `}
            >
              {rule.valid ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}

              {rule.label}
            </div>
          ))}
        </div>
      </div>

      {/* CONFIRM PASSWORD */}
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          p-4
        "
      >
        <Text className="text-gray-300 text-sm mb-3">Confirmar contraseña</Text>

        <div className="relative">
          <InputField
            placeholder="••••••••"
            inputSize="full"
            rounded="md"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              pr-12
              bg-transparent
              border-white/10
              text-white
              placeholder:text-gray-500
            "
          />

          <button
            type="button"
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-white
              transition-colors
            "
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <AiOutlineEyeInvisible className="w-5 h-5" />
            ) : (
              <AiOutlineEye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* SECURITY */}
      <div
        className="
          flex
          items-center
          gap-2
          text-emerald-300
          text-sm
          px-4
          py-3
          rounded-2xl
          border
          border-emerald-500/10
          bg-emerald-500/5
        "
      >
        <ShieldCheck className="w-4 h-4" />
        Tu contraseña será almacenada de forma segura
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
          "
        >
          <Text className="text-red-300 text-sm">{error}</Text>
        </div>
      )}

      {/* BUTTON */}
      <Button
        type="submit"
        disabled={isPending || !allValid}
        colVariant="success"
        className="
          w-full
          py-4
          rounded-2xl
          font-semibold
          text-base
          shadow-lg
          hover:scale-[1.01]
          active:scale-[0.99]
          transition-all
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {isPending ? "Actualizando..." : "Restablecer contraseña"}
      </Button>
    </form>
  );
}
