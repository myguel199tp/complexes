"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useGenerateOtp, useVerifyOtpAndCreate } from "./otpBankMutation";

type Props = {
  conjuntoId: string;
  formData: {
    bankName: string;
    accountNumber: string;
    accountType: "SAVINGS" | "CHECKING";
  };
  onSuccess: () => void;
};

type OtpForm = {
  otp: string;
};

export default function OtpStep({ conjuntoId, formData, onSuccess }: Props) {
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
      <h2 className="text-xl font-semibold">Verificación OTP</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          maxLength={6}
          placeholder="Código OTP"
          className="border p-3 text-center tracking-widest text-lg"
          {...register("otp", { required: true })}
        />

        <button
          type="submit"
          disabled={createAccount.isPending}
          className="bg-black text-white p-2 rounded"
        >
          {createAccount.isPending ? "Verificando..." : "Confirmar"}
        </button>
      </form>

      {/* 🔁 resend */}
      <div className="text-center text-sm">
        {counter > 0 ? (
          <span>Reenviar en {counter}s</span>
        ) : (
          <button onClick={handleResend} className="text-blue-500 underline">
            Reenviar OTP
          </button>
        )}
      </div>

      {/* ❌ error */}
      {createAccount.isError && (
        <p className="text-red-500 text-sm">Código inválido o expirado</p>
      )}
    </div>
  );
}
