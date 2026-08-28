"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useB2bAccess } from "../../_lib/use-b2b-access";
import { B2B_ACCESS_STATUS_KEY } from "../services/b2bAccessService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bBillingPeriod,
  B2bPlanInput,
  B2bPricingModel,
  createB2bPlan,
  deleteB2bPlan,
  getB2bPlans,
  updateB2bPlan,
} from "../services/b2bPlansService";

const emptyForm: B2bPlanInput = {
  name: "",
  description: "",
  price: 0,
  currency: "COP",
  billingPeriod: "mensual",
  pricingModel: "fijo",
  isActive: true,
};

export default function ComercioB2bPlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [form, setForm] = useState<B2bPlanInput>(emptyForm);

  useComercioGuard(() => router.push("/comercio/login"));

  const { data: plans, isLoading } = useQuery({
    queryKey: ["comercio_b2b_plans"],
    queryFn: getB2bPlans,
  });

  const { limits, remaining } = useB2bAccess();

  // Cuántos planes admite todavía el plan de acceso pagado. null = sin tope.
  const plansLeft = remaining("servicePlans");
  const atPlanLimit = plansLeft !== null && plansLeft <= 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_plans"] });
    // El consumo del tope viaja dentro del estado de acceso: sin esto el
    // contador seguiría mostrando el número anterior.
    queryClient.invalidateQueries({ queryKey: B2B_ACCESS_STATUS_KEY });
  };

  const createMut = useMutation({
    mutationFn: () => createB2bPlan(form),
    onSuccess: () => {
      showAlert("Plan creado", "success");
      setForm(emptyForm);
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const toggleMut = useMutation({
    mutationFn: (p: { id: string; isActive: boolean }) =>
      updateB2bPlan(p.id, { isActive: p.isActive }),
    onSuccess: invalidate,
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteB2bPlan(id),
    onSuccess: () => {
      showAlert("Plan eliminado", "success");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const set = <K extends keyof B2bPlanInput>(key: K, value: B2bPlanInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Planes de servicio
          </Title>
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver
          </Link>
        </div>

        {limits?.maxServicePlans != null && (
          <Text
            size="sm"
            className={`mt-2 ${atPlanLimit ? "text-amber-300" : "text-slate-400"}`}
          >
            {plans?.length ?? 0} de {limits.maxServicePlans} planes de tu plan de
            acceso
            {atPlanLimit
              ? " · llegaste al tope: elimina uno o mejora tu plan."
              : ` · te quedan ${plansLeft}.`}
          </Text>
        )}

        {/* Formulario de creación */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid gap-3">
          <input
            className="input-b2b"
            placeholder="Nombre del plan"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <textarea
            className="input-b2b"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-b2b"
              type="number"
              placeholder="Precio"
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
            />
            <select
              className="input-b2b"
              value={form.pricingModel}
              onChange={(e) =>
                set("pricingModel", e.target.value as B2bPricingModel)
              }
            >
              <option value="fijo">Precio fijo</option>
              <option value="por_apartamento">Por apartamento</option>
            </select>
            <select
              className="input-b2b"
              value={form.billingPeriod}
              onChange={(e) =>
                set("billingPeriod", e.target.value as B2bBillingPeriod)
              }
            >
              <option value="mensual">Mensual</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
            <input
              className="input-b2b"
              placeholder="Moneda"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
          </div>
          <Button
            colVariant="success"
            size="sm"
            rounded="md"
            onClick={() => createMut.mutate()}
            disabled={
              createMut.isLoading || !form.name || form.price <= 0 || atPlanLimit
            }
          >
            {createMut.isLoading ? "Creando..." : "Crear plan"}
          </Button>

          {atPlanLimit && (
            <Text size="xs" className="text-amber-300">
              Tu plan de acceso no permite publicar más planes de servicio.
            </Text>
          )}
        </div>

        {/* Listado */}
        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">Cargando...</Text>
          ) : plans && plans.length > 0 ? (
            plans.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex justify-between gap-3"
              >
                <div>
                  <Text size="sm" font="semi" className="text-slate-100">
                    {p.name}{" "}
                    <span
                      className={`ml-2 text-xs ${p.isActive ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {p.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </Text>
                  <Text size="xs" className="text-slate-400">{p.description}</Text>
                  <Text size="sm" className="text-slate-300 mt-1">
                    {p.price} {p.currency} / {p.billingPeriod}
                    {p.pricingModel === "por_apartamento"
                      ? " · por apartamento"
                      : ""}
                  </Text>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    colVariant="default"
                    size="xs"
                    rounded="md"
                    onClick={() =>
                      toggleMut.mutate({ id: p.id, isActive: !p.isActive })
                    }
                  >
                    {p.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    colVariant="danger"
                    size="xs"
                    rounded="md"
                    onClick={() => deleteMut.mutate(p.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <Text size="sm" className="text-slate-400">
              Aún no tienes planes. Crea el primero arriba.
            </Text>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-b2b {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          width: 100%;
        }
        .input-b2b::placeholder {
          color: #64748b;
        }
        .input-b2b option {
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}
