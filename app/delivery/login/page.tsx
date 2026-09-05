"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, InputField, Text, Title } from "complexes-next-components";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { MdMarkEmailUnread } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { ImSpinner9 } from "react-icons/im";

/**
 * Login del repartidor.
 *
 * Formulario propio y no el del comercio: son dos identidades distintas y cada
 * una guarda su cookie, así que iniciar sesión aquí no debe tocar la del
 * comercio en el mismo navegador —algo habitual, porque el dueño del negocio y
 * su repartidor suelen compartir el mostrador.
 */
export default function DeliveryLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/delivery/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "No pudimos iniciar sesión",
        );
      }

      router.push("/delivery/orders");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img
              src="/complex.png"
              alt="globaliaph"
              className="h-24 w-auto rounded-2xl shadow-lg"
            />
            <Title as="h1" size="sm" font="bold" colVariant="on" className="mt-5">
              Repartidor
            </Title>
            <Text size="sm" className="mt-2 text-center text-slate-400">
              Entra para ver los pedidos que te asignaron
            </Text>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              regexType="email"
              placeholder="Correo electrónico"
              helpText="Correo electrónico"
              prefixElement={<MdMarkEmailUnread size={15} />}
              sizeHelp="sm"
              inputSize="md"
              rounded="md"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />

            <div className="relative">
              <InputField
                placeholder="Contraseña"
                helpText="Contraseña"
                prefixElement={<RiLockPasswordLine size={15} />}
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-slate-400"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <IoEyeOffSharp size={18} />
                ) : (
                  <IoEyeSharp size={18} />
                )}
              </button>
            </div>

            {error ? (
              <Text size="sm" colVariant="danger">
                {error}
              </Text>
            ) : null}

            <Button
              type="submit"
              colVariant="success"
              size="md"
              rounded="md"
              className="w-full"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <ImSpinner9 className="animate-spin" /> Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <Text size="xs" className="mt-6 text-center text-slate-500">
            Tu comercio crea tu cuenta. Si no tienes acceso, pídele que la
            active desde su panel.
          </Text>
        </div>
      </div>
    </div>
  );
}
