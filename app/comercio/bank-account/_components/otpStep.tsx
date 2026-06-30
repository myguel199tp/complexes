"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button, InputField } from "complexes-next-components";
import {
  createBankAccount,
  generateBankOtp,
  CreateComercioBankPayload,
} from "../services/comercioBankService";

type Props = {
  formData: Omit<CreateComercioBankPayload, "otp">;
  onSuccess: () => void;
  onError: (message: string) => void;
};

type OtpForm = {
  otp: string;
};

export default function OtpStep({ formData, onSuccess, onError }: Props) {
  const { register, handleSubmit, setFocus } = useForm<OtpForm>();
  const [counter, setCounter] = useState(60);
  const sentRef = useRef(false);

  const generateOtp = useMutation({ mutationFn: generateBankOtp });
  const createAccount = useMutation({
    mutationFn: (otp: string) => createBankAccount({ ...formData, otp }),
  });

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    generateOtp.mutate();
    setFocus("otp");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (counter === 0) return;
    const interval = setInterval(() => setCounter((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [counter]);

  const onSubmit = async (data: OtpForm) => {
    try {
      await createAccount.mutateAsync(data.otp);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Código inválido o expirado");
    }
  };

  const handleResend = () => {
    generateOtp.mutate();
    setCounter(60);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-slate-400 text-sm">
        Enviamos un código de verificación a tu correo registrado.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <InputField
          maxLength={6}
          placeholder="Código OTP"
          helpText="Código de verificación"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          {...register("otp", { required: true })}
        />

        <Button
          type="submit"
          colVariant="success"
          size="full"
          rounded="md"
          disabled={createAccount.isPending}
        >
          {createAccount.isPending ? "Verificando..." : "Confirmar"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        {counter > 0 ? (
          <span>Reenviar en {counter}s</span>
        ) : (
          <button onClick={handleResend} className="text-cyan-400 underline">
            Reenviar OTP
          </button>
        )}
      </div>
    </div>
  );
}
