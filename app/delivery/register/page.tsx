"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { Button } from "@/app/components/ui/form";
import { cityOptionsFor } from "@/app/helpers/countryCity";
import { registerDelivery } from "../services/deliveryOrdersService";

const VEHICLES = [
  { value: "motorcycle", label: "Moto" },
  { value: "bicycle", label: "Bicicleta" },
  { value: "car", label: "Carro" },
  { value: "van", label: "Camioneta" },
  { value: "walking", label: "A pie" },
];

const inputCls =
  "mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100";

/**
 * Registro propio del repartidor.
 *
 * Antes no había: la cuenta solo existía si un comercio la creaba. Ahora quien
 * busca trabajo se registra, activa con el enlace del correo, se identifica y
 * decide si aparece en la bolsa. La contraseña no se pide aquí: se pone desde
 * el enlace, igual que en una invitación, para que nadie abra una cuenta con
 * un correo que no es suyo.
 */
export default function DeliveryRegisterPage() {
  const cityOptions = useMemo(() => cityOptionsFor("CO"), []);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    vehicleType: "motorcycle",
    licensePlate: "",
    workCity: "",
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerDelivery({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        indicative: "+57",
        vehicleType: form.vehicleType,
        licensePlate: form.licensePlate.trim() || undefined,
        workCity: form.workCity || undefined,
        workCountry: form.workCity ? "Colombia" : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear tu cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          <Title as="h1" size="sm" font="bold" colVariant="on">
            Quiero repartir
          </Title>

          {done ? (
            <>
              <Text size="sm" className="mt-3 text-slate-300">
                Listo. Si el correo no tenía cuenta, te llegó un enlace para
                activarla y crear tu contraseña. Después te pediremos una foto
                de tu rostro y tu documento.
              </Text>
              <Text size="xs" className="mt-3 text-slate-500">
                ¿No te llegó? Revisa el correo no deseado o vuelve a
                registrarte con el mismo correo en unos minutos.
              </Text>
              <Link
                href="/delivery/login"
                className="mt-6 block text-center text-sm text-cyan-400 hover:text-cyan-300"
              >
                Ir a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <Text size="sm" className="mt-2 text-slate-400">
                Crea tu cuenta, identifícate y postúlate a los comercios que
                están contratando cerca de ti. Con la misma cuenta puedes
                trabajar para varios.
              </Text>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-xs text-slate-400">
                  Nombre completo
                  <input
                    required
                    maxLength={120}
                    value={form.fullName}
                    onChange={set("fullName")}
                    className={inputCls}
                    autoComplete="name"
                  />
                </label>
                <label className="block text-xs text-slate-400">
                  Correo electrónico
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    className={inputCls}
                    autoComplete="email"
                  />
                </label>
                <label className="block text-xs text-slate-400">
                  Celular
                  <input
                    required
                    inputMode="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputCls}
                    autoComplete="tel"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs text-slate-400">
                    Vehículo
                    <select
                      value={form.vehicleType}
                      onChange={set("vehicleType")}
                      className={inputCls}
                    >
                      {VEHICLES.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-400">
                    Placa (si tiene)
                    <input
                      maxLength={12}
                      value={form.licensePlate}
                      onChange={set("licensePlate")}
                      className={inputCls}
                    />
                  </label>
                </div>
                <label className="block text-xs text-slate-400">
                  Ciudad donde quieres trabajar
                  <select
                    value={form.workCity}
                    onChange={set("workCity")}
                    className={inputCls}
                  >
                    <option value="">Elige tu ciudad</option>
                    {cityOptions.map((city) => (
                      <option key={city.value} value={city.label}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </label>

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
                    isSubmitting || !form.fullName || !form.email || !form.phone
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <ImSpinner9 className="animate-spin" /> Creando...
                    </span>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              <Link
                href="/delivery/login"
                className="mt-6 block text-center text-sm text-cyan-400 hover:text-cyan-300"
              >
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
