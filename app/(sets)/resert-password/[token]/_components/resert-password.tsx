// components/ResetPassword.tsx
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
    <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
      <div className="relative mt-2">
        <InputField
          placeholder="Nueva contraseña"
          inputSize="full"
          rounded="md"
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </div>
      </div>

      {error && <Text className="text-red-500 text-sm">{error}</Text>}

      <Button type="submit" colVariant="warning">
        Restablecer contraseña
      </Button>
    </form>
  );
}
