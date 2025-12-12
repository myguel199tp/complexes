"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { VerifyOtp } from "@/app/auth/services/veifyOpt";
import { VerifyOtpRequest } from "@/app/auth/services/request/verifyOpt";
import { route } from "@/app/_domain/constants/routes";
import { Buton, Button, Text, Title } from "complexes-next-components";

type TokenPayload = {
  role: string;
  name: string;
  lastName: string;
  email: string;
  id: string;
  nit: string;
  file: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
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

    const data: VerifyOtpRequest = { userId, otp: code };

    try {
      setLoading(true);

      const response = await VerifyOtp(data);
      console.log("response token", response);

      setCookie(null, "accessToken", String(response?.accessToken), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        sameSite: "lax",
      });

      setCookie(null, "refreshToken", String(response?.refreshToken), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        sameSite: "lax",
      });

      const payload = jwtDecode<TokenPayload>(String(response?.accessToken));

      if (payload.role === "user") {
        router.push(route.myprofile);
      } else {
        router.push(route.ensemble);
      }
    } catch {
      alert("OTP incorrecto o expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <Title font="semi" className="text-center mb-4">
          Verificación
        </Title>
        <Text className="text-center mb-6">
          Ingresa el código de 6 dígitos que enviamos a tu correo
        </Text>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  if (el) inputsRef.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-12 border-2 border-gray-300 text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <Button
            type="submit"
            colVariant="warning"
            rounded="lg"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>

        {/* MENSAJE DE ADVERTENCIA */}
        <Text className="text-center text-sm text-red-500 mt-4">
          ⚠️ Recuerda no compartir este código. Es válido solo por 5 minutos.
        </Text>

        <Buton
          onClick={() => router.back()}
          borderWidth="none"
          colVariant="primary"
          className="mt-4 hover:underline text-center w-full"
        >
          ← Regresar
        </Buton>
      </div>
    </div>
  );
}
