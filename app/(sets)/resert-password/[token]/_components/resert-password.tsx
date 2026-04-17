"use client";

import React, { useState } from "react";
import { InputField, Button, Text } from "complexes-next-components";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useResetPasswordMutation } from "./use-reset-mutation";
import { useParams } from "next/navigation";

export default function ResetPassword() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { mutate } = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !newPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setError("");
    mutate({ token, newPassword });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto px-4 sm:px-0 space-y-4 mt-6"
    >
      <div className="relative w-full">
        <InputField
          placeholder="Nueva contraseña"
          inputSize="full"
          rounded="md"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="pr-12"
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <AiOutlineEye className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      </div>

      {error && (
        <Text className="text-red-500 text-sm text-center">{error}</Text>
      )}

      <Button
        type="submit"
        colVariant="success"
        className="w-full py-3 text-sm sm:text-base"
      >
        Restablecer contraseña
      </Button>
    </form>
  );
}
