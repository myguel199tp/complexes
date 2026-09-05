"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, InputField, Text, Title } from "complexes-next-components";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { activateAccount } from "../../../services/deliveryOrdersService";

/** Debe coincidir con el mínimo que valida el backend. */
const PASSWORD_MIN = 8;

/**
 * Activación de la cuenta del repartidor.
 *
 * Es la pantalla que reemplaza a la contraseña dictada por WhatsApp: el
 * comercio da de alta a la persona sin credencial y el enlace del correo la
 * trae aquí a ponerla ella. Es pública a propósito —todavía no hay sesión que
 * la autentique; lo que la autoriza es el token, que sirve una sola vez.
 */
export default function DeliveryActivatePage() {
  const router = useRouter();
  const params = useParams<{ id: string; token: string }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const tooShort = password.length > 0 && password.length < PASSWORD_MIN;
  const mismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await activateAccount(params.id, params.token, password);
      // Al login y no directo a los pedidos: la sesión se crea al entrar, y
      // mandarlo a una pantalla protegida sin sesión lo devolvería igual.
      router.push("/delivery/login");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos activar la cuenta",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          <Title as="h1" size="sm" font="bold" colVariant="on">
            Crea tu contraseña
          </Title>
          <Text size="sm" className="mt-2 text-slate-400">
            Tu comercio te dio de alta como repartidor. Elige una contraseña:
            solo tú la vas a conocer.
          </Text>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <InputField
                placeholder="Contraseña nueva"
                helpText={`Contraseña (mínimo ${PASSWORD_MIN} caracteres)`}
                prefixElement={<RiLockPasswordLine size={15} />}
                sizeHelp="sm"
                inputSize="md"
                rounded="md"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

            <InputField
              placeholder="Repite la contraseña"
              helpText="Repite la contraseña"
              prefixElement={<RiLockPasswordLine size={15} />}
              sizeHelp="sm"
              inputSize="md"
              rounded="md"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirm(e.target.value)
              }
            />

            {tooShort ? (
              <Text size="xs" className="text-amber-300">
                Faltan {PASSWORD_MIN - password.length} caracteres.
              </Text>
            ) : null}

            {mismatch ? (
              <Text size="xs" className="text-amber-300">
                Las dos contraseñas no coinciden.
              </Text>
            ) : null}

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
              disabled={
                isSubmitting ||
                password.length < PASSWORD_MIN ||
                confirm !== password
              }
            >
              {isSubmitting ? "Activando..." : "Activar mi cuenta"}
            </Button>
          </form>

          <Text size="xs" className="mt-6 text-center text-slate-500">
            El enlace sirve una sola vez y vence a los 3 días. Si ya venció,
            pídele a tu comercio que te lo reenvíe.
          </Text>
        </div>
      </div>
    </div>
  );
}
