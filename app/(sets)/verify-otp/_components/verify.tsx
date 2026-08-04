"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerifyOtp } from "@/app/auth/services/veifyOpt";
import { VerifyOtpRequest } from "@/app/auth/services/request/verifyOpt";
import { route } from "@/app/_domain/constants/routes";
import { Button, Text, Title } from "complexes-next-components";
import { useSession } from "@/app/components/session-provider";
import { getDeviceId } from "@/app/helpers/device";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { reload } = useSession();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos

  const inputsRef = useRef<HTMLInputElement[]>([]);

  // ⏱ Cuenta regresiva
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Rellena desde `index` con todos los dígitos recibidos (1 al escribir,
  // varios al pegar o con el autofill del SMS/correo) y mueve el foco al final.
  const fillFrom = (index: number, digits: string) => {
    const updated = [...otp];
    for (let i = 0; i < digits.length && index + i < updated.length; i++) {
      updated[index + i] = digits[i];
    }
    setOtp(updated);

    const nextIndex = Math.min(index + digits.length, updated.length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      // Permite borrar el dígito actual
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    // Un código completo (pegado o autofill) siempre arranca en la primera casilla.
    fillFrom(
      digits.length >= otp.length ? 0 : index,
      digits.slice(0, otp.length),
    );
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement | HTMLDivElement>,
  ) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;

    e.preventDefault();
    // Si pegan el código completo, se reparte siempre desde la primera casilla,
    // sin importar en cuál estaba el foco.
    fillFrom(digits.length >= otp.length ? 0 : index, digits.slice(0, otp.length));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const code = otp.join("");

    if (code.length < 6) {
      alert("Debes ingresar los 6 dígitos.");
      return;
    }

    const data: VerifyOtpRequest = {
      userId,
      otp: code,
      deviceId: getDeviceId(),
    };
    try {
      setLoading(true);

      const response = await VerifyOtp(data);

      // /api/auth/verify-otp ya dejó la sesión en cookies httpOnly; los roles
      // llegan en el cuerpo porque el cliente no puede decodificar el token.
      const roles = response.roles ?? [];

      await reload();

      // Solo el usuario "user puro" (sin otros roles) va directo a su perfil.
      // El resto pasa por /ensemble para seleccionar conjunto.
      const isPlainUser = roles.length === 1 && roles[0] === "user";

      if (isPlainUser) {
        router.replace(route.myprofile);
      } else {
        router.replace(route.ensemble);
      }
    } catch (error) {
      // El mensaje viene del backend: mostrarlo evita que un fallo del servidor
      // se lea como "el código está mal" y el usuario reintente en vano.
      alert(
        error instanceof Error && error.message
          ? error.message
          : "OTP incorrecto o expirado",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
    relative
    min-h-screen
    overflow-hidden
    flex
    items-center
    justify-center
    px-4
    bg-black
    "
    >
      {/* Background image */}
      <div
        className="
      absolute
      inset-0
      bg-cover
      bg-center
      scale-105
      "
        style={{
          backgroundImage: "url('/cici.jpg')",
        }}
      />

      {/* Cinematic dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Luxury gradient */}
      <div
        className="
      absolute
      inset-0
      bg-gradient-to-br
      from-black/40
      via-black/20
      to-black/70
      "
      />

      {/* subtle lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/[0.03] blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-3xl rounded-full" />

      {/* premium grid */}
      <div
        className="
      absolute
      inset-0
      opacity-[0.04]
      bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
      bg-[size:50px_50px]
      "
      />

      {/* CARD */}
      <div
        className="
      relative
      z-10
      w-full
      max-w-md
      overflow-hidden
      rounded-[36px]
      border
      border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      shadow-[0_20px_80px_rgba(0,0,0,0.65)]
      "
      >
        {/* premium border glow */}
        <div
          className="
        absolute
        inset-0
        rounded-[36px]
        border
        border-white/5
        "
        />

        {/* top gradient line */}
        <div
          className="
        absolute
        top-0
        left-0
        h-[2px]
        w-full
        bg-gradient-to-r
        from-transparent
        via-white/60
        to-transparent
        "
        />

        <div className="relative z-10 p-5 sm:p-8">
          {/* ICON */}
          <div className="flex justify-center mb-8">
            <div
              className="
            relative
            flex
            items-center
            justify-center
            w-20
            h-20
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            "
            >
              <div className="text-white text-3xl">✦</div>

              <div
                className="
              absolute
              inset-0
              rounded-[28px]
              bg-gradient-to-br
              from-white/[0.08]
              to-transparent
              "
              />
            </div>
          </div>

          {/* TITLE */}
          <div className="text-center mb-8">
            <Title
              font="bold"
              className="
            text-white
            text-3xl
            tracking-tight
            mb-3
            "
            >
              Verificación
            </Title>

            <Text
              className="
            text-white/55
            leading-relaxed
            text-sm
            "
            >
              Ingresa el código de seguridad enviado a tu correo y WhatsApp
            </Text>
          </div>

          {/* TIMER */}
          <div className="flex justify-center mb-8">
            <div
              className="
            px-4
            py-2
            rounded-full
            border
            border-white/10
            bg-white/[0.03]
            "
            >
              <Text
                className="
              text-white/80
              font-medium
              tracking-[0.2em]
              text-sm
              "
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </Text>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* OTP INPUTS */}
            {/* Grid en vez de anchos fijos: con `w-14` las 6 casillas suman más
                que el ancho útil de la tarjeta en un móvil de 360px y las dos
                últimas quedaban fuera de pantalla. */}
            <div
              className="grid grid-cols-6 gap-1.5 sm:gap-3"
              onPaste={(e) => handlePaste(0, e)}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    if (el) inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  value={digit}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  className="
                w-full
                min-w-0
                h-14
                sm:h-16
                rounded-xl
                sm:rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                text-center
                text-xl
                sm:text-2xl
                text-white
                font-semibold
                outline-none
                transition-all
                duration-300
                focus:border-white/30
                focus:bg-white/[0.06]
                focus:scale-105
                focus:shadow-[0_0_20px_rgba(255,255,255,0.08)]
                "
                />
              ))}
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              colVariant="success"
              rounded="lg"
              disabled={loading || timeLeft <= 0}
            >
              {loading ? "Verificando..." : "Verificar"}
            </Button>
          </form>

          {/* ERROR */}
          {timeLeft <= 0 && (
            <div
              className="
            mt-6
            rounded-2xl
            border
            border-red-500/10
            bg-red-500/5
            p-4
            text-center
            "
            >
              <Text className="text-red-300/80 text-sm">
                El código expiró. Solicita uno nuevo.
              </Text>
            </div>
          )}

          {/* BACK */}
          <button
            onClick={() => router.back()}
            className="
          mt-6
          w-full
          text-center
          text-sm
          text-white/40
          transition-all
          duration-300
          hover:text-white/80
          "
          >
            ← Regresar
          </button>
        </div>
      </div>
    </div>
  );
}
