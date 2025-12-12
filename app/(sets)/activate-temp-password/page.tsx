"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activateTempPassword } from "@/app/auth/services/active-temp";
import { Title, Text } from "complexes-next-components";

export default function ActivateTempPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("El enlace no es válido o ha expirado.");

    setLoading(true);
    setError("");

    try {
      await activateTempPassword({ userId, newPassword: password });
      router.push("/auth");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error activando tu contraseña. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fade-in">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <Title size="sm" font="bold">
            Activa tu contraseña temporal
          </Title>
          <Text size="sm">
            Ingresa una nueva contraseña segura para activar tu cuenta y acceder
            nuevamente al sistema.
          </Text>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none placeholder-gray-400"
            />
            <Text size="sm">
              Debe tener al menos 8 caracteres, incluir mayúsculas, números y un
              símbolo especial.
            </Text>
          </div>

          {error && (
            <Text size="xs" colVariant="danger">
              {error}
            </Text>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all shadow-sm ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Activando contraseña...
              </span>
            ) : (
              "Activar contraseña"
            )}
          </button>
        </form>

        {/* Pie de página */}
        <Text size="sm">
          Una vez activada, podrás iniciar sesión con tu nueva contraseña.
        </Text>
      </div>
    </div>
  );
}
