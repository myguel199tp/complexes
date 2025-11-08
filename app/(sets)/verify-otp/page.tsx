"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "nookies";
import { route } from "@/app/_domain/constants/routes";
import { jwtDecode } from "jwt-decode";
import { VerifyOtp } from "@/app/auth/services/veifyOpt";
import { VerifyOtpRequest } from "@/app/auth/services/request/verifyOpt";

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

  // ✅ Asegura que userId siempre sea string
  const userId = searchParams.get("userId") ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert("Falta el identificador de usuario (userId).");
      return;
    }

    setLoading(true);

    const data: VerifyOtpRequest = { userId, otp };

    try {
      const response = await VerifyOtp(data);

      // ✅ Guardamos tokens en cookies
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "OTP incorrecto o expirado");
      } else {
        alert("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Verificación OTP
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Ingresa el código OTP que recibiste en tu correo electrónico. Este
          código es válido solo por unos minutos.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Código OTP"
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-500 hover:underline text-center w-full"
        >
          ← Regresar
        </button>
      </div>
    </div>
  );
}
