"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useGenerateOtp, useVerifyOtpAndCreate } from "./otpBankMutation";
import { Button, InputField, Text } from "complexes-next-components";

type Props = {
  conjuntoId: string;
  formData: {
    bankName: string;
    accountNumber: string;
    accountType: "SAVINGS" | "CHECKING";
  };
  onSuccess: () => void;
  onBack?: () => void;
};

type OtpForm = {
  otp: string;
};

/**
 * El backend responde con el JSON de Nest serializado dentro del `Error`, así
 * que sacamos el `message` real para no mostrar siempre "código inválido"
 * cuando en realidad la cuenta ya existía o el OTP expiró.
 */
function readBackendMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  try {
    const parsed = JSON.parse(error.message);
    const message = parsed?.message;

    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  } catch {
    // No era JSON: nos quedamos con el fallback.
  }

  return fallback;
}

export default function OtpStep({
  conjuntoId,
  formData,
  onSuccess,
  onBack,
}: Props) {
  const { register, handleSubmit, setFocus } = useForm<OtpForm>();

  const generateOtp = useGenerateOtp(conjuntoId);
  const createAccount = useVerifyOtpAndCreate(conjuntoId);

  const [counter, setCounter] = useState(60);

  const sentRef = useRef(false);

  useEffect(() => {
    if (!conjuntoId) return;

    if (sentRef.current) return;

    sentRef.current = true;

    generateOtp.mutate();
    setFocus("otp");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conjuntoId]);

  // ⏳ contador
  useEffect(() => {
    if (counter === 0) return;

    const interval = setInterval(() => {
      setCounter((p) => p - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [counter]);

  const onSubmit = async (data: OtpForm) => {
    try {
      await createAccount.mutateAsync({
        ...formData,
        otp: data.otp,
        country: "CO", // o del usuario
        currency: "COP", // o del usuario
      });
      onSuccess();
    } catch (err) {
      console.error("OTP ERROR:", err);
    }
  };

  const handleResend = () => {
    generateOtp.mutate();
    setCounter(60);
  };

  return (
    <div className="flex flex-col gap-4">
      <Text colVariant="on" as="h2" size="md" font="semi">
        Verificación OTP
      </Text>

      <Text size="xs" className="text-gray-500">
        Vas a registrar la cuenta {formData.accountNumber} de{" "}
        {formData.bankName}. Te enviamos un código a tu correo.
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <InputField
          regexType="alphanumeric"
          maxLength={6}
          helpText="Código OTP"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          placeholder="Código OTP"
          className="text-center tracking-widest"
          {...register("otp", { required: true })}
        />

        <div className="flex gap-2">
          {onBack && (
            <Button
              type="button"
              colVariant="default"
              rounded="md"
              size="full"
              onClick={onBack}
              disabled={createAccount.isPending}
            >
              Volver
            </Button>
          )}

          <Button
            type="submit"
            colVariant="success"
            rounded="md"
            size="full"
            disabled={createAccount.isPending}
          >
            {createAccount.isPending ? "Verificando..." : "Confirmar"}
          </Button>
        </div>
      </form>

      {/* 🔁 resend */}
      <div className="text-center text-sm">
        {counter > 0 ? (
          <span>Reenviar en {counter}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-blue-500 underline"
          >
            Reenviar OTP
          </button>
        )}
      </div>

      {/* ❌ error */}
      {createAccount.isError && (
        <Text size="sm" colVariant="danger">
          {readBackendMessage(
            createAccount.error,
            "Código inválido o expirado",
          )}
        </Text>
      )}
    </div>
  );
}
