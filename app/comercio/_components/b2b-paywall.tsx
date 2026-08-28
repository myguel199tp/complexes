"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import {
  IoCheckmarkCircle,
  IoLockClosed,
  IoShieldCheckmark,
} from "react-icons/io5";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2B_ACCESS_STATUS_KEY,
  B2bAccessPlan,
  B2bAccessStatus,
  billingPeriodLabel,
  formatComercioPrice,
  getB2bAccessPlans,
  getB2bAccessStatus,
  payB2bAccess,
} from "../b2b/services/b2bAccessService";

/**
 * Deja pasar a `children` sólo cuando el comercio puede operar:
 *
 * - B2C: siempre (`applies: false`, este cobro no les aplica).
 * - B2B: sólo con una suscripción vigente; si no la tiene, en lugar del
 *   contenido se muestra el módulo de cobro con los planes del catálogo.
 *
 * Los planes y el estado del pago los manda el backend —el ERP los
 * administra—, así que aquí no hay ningún precio ni vencimiento quemado.
 */
export default function ComercioB2bPaywall({
  children,
  standalone = false,
}: Readonly<{
  children: React.ReactNode;
  /**
   * Modo para envolver una pantalla completa (el layout de /comercio/b2b): el
   * cobro se pinta con su propio contenedor y, si ya está pagado, se deja pasar
   * el contenido sin la franja de estado —esa vive en el dashboard—.
   */
  standalone?: boolean;
}>) {
  const [changingPlan, setChangingPlan] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: B2B_ACCESS_STATUS_KEY,
    queryFn: getB2bAccessStatus,
  });

  if (isLoading || !status) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  if (!status.applies) return <>{children}</>;

  if (!status.planActive) {
    const checkout = (
      <B2bCheckout status={status} onPaid={() => setChangingPlan(false)} />
    );

    if (!standalone) return checkout;

    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Panel de Comercio
          </Title>
          {checkout}
        </div>
      </div>
    );
  }

  if (standalone) return <>{children}</>;

  return (
    <>
      <ActiveSubscriptionBanner
        status={status}
        onChangePlan={() => setChangingPlan((open) => !open)}
        isChanging={changingPlan}
      />

      {changingPlan ? (
        <B2bCheckout status={status} onPaid={() => setChangingPlan(false)} />
      ) : (
        children
      )}
    </>
  );
}

function ActiveSubscriptionBanner({
  status,
  onChangePlan,
  isChanging,
}: {
  status: B2bAccessStatus;
  onChangePlan: () => void;
  isChanging: boolean;
}) {
  const { plan, subscription } = status;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3">
      <span className="flex items-center gap-2">
        <IoShieldCheckmark size={20} className="shrink-0 text-emerald-400" />
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-slate-100">
            Plan {plan?.name} activo
          </span>
          {subscription && (
            <span className="text-xs text-slate-400">
              Renueva el{" "}
              {new Date(subscription.expiresAt).toLocaleDateString("es-CO")} ·
              Pago {subscription.simulated ? "simulado " : ""}
              {subscription.reference}
            </span>
          )}
        </span>
      </span>

      <Button size="sm" rounded="md" colVariant="default" onClick={onChangePlan}>
        {isChanging ? "Volver al panel" : "Cambiar plan"}
      </Button>
    </div>
  );
}

/* ─────────────────────── Módulo de cobro (simulado) ─────────────────────── */

function B2bCheckout({
  status,
  onPaid,
}: {
  status: B2bAccessStatus;
  onPaid: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["comercio_b2b_access_plans"],
    queryFn: getB2bAccessPlans,
  });

  const isRenewal = status.planActive;
  const currentCode = status.plan?.code ?? null;

  // Sin elección explícita se propone el destacado —y en una renovación, el
  // plan que el comercio ya tiene—.
  const selected: B2bAccessPlan | null =
    plans?.find((plan) => plan.id === selectedId) ??
    plans?.find((plan) => plan.code === currentCode) ??
    plans?.find((plan) => plan.isHighlighted) ??
    plans?.[0] ??
    null;

  const payMutation = useMutation({
    mutationFn: (planId: string) => payB2bAccess(planId),
    onSuccess: (result) => {
      showAlert(`Pago aprobado · Plan ${result.plan?.name ?? ""}`, "success");
      queryClient.setQueryData(B2B_ACCESS_STATUS_KEY, result);
      queryClient.invalidateQueries({ queryKey: B2B_ACCESS_STATUS_KEY });
      onPaid();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const paying = payMutation.isPending;

  return (
    <div className="mt-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-4">
        <IoLockClosed size={22} className="mt-0.5 shrink-0 text-amber-400" />
        <span className="flex flex-col">
          <span className="font-semibold text-slate-100">
            {isRenewal
              ? "Elige tu nuevo plan"
              : "Activa tu suscripción para operar"}
          </span>
          <span className="text-xs text-slate-400">
            Los comercios B2B necesitan un plan activo para publicar planes de
            servicio, aceptar contratos y ver su agenda.
            {status.expiredAt &&
              ` Tu plan anterior venció el ${new Date(
                status.expiredAt,
              ).toLocaleDateString("es-CO")}.`}
          </span>
        </span>
      </div>

      <Title as="h2" size="sm" colVariant="on" font="semi" className="mt-6">
        Planes disponibles
      </Title>

      {isLoading && (
        <Text size="sm" className="mt-3 text-slate-500">
          Cargando planes…
        </Text>
      )}

      {plans?.length === 0 && (
        <Text size="sm" className="mt-3 text-amber-300">
          No hay planes disponibles en este momento. Escríbenos para activar tu
          cuenta.
        </Text>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans?.map((plan) => {
          const isSelected = plan.id === selected?.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedId(plan.id)}
              disabled={paying}
              className={`flex flex-col rounded-2xl border p-5 text-left transition disabled:opacity-60 ${
                isSelected
                  ? "border-purple-400/70 bg-purple-500/[0.12]"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-100">
                  {plan.name}
                </span>
                {plan.isHighlighted && (
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-300">
                    Recomendado
                  </span>
                )}
              </span>

              <span className="mt-2 text-2xl font-semibold text-slate-100">
                {formatComercioPrice(plan.price, plan.currency)}
              </span>
              <span className="text-xs text-slate-500">
                / {billingPeriodLabel(plan.billingPeriod)}
              </span>

              {plan.tagline && (
                <span className="mt-2 text-xs text-slate-400">
                  {plan.tagline}
                </span>
              )}

              <ul className="mt-4 flex flex-col gap-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-slate-300"
                  >
                    <IoCheckmarkCircle
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.code === currentCode && (
                <span className="mt-4 text-[11px] font-semibold text-emerald-300">
                  Plan actual
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-400">Plan seleccionado</span>
            <span className="font-semibold text-slate-100">{selected.name}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-sm">
            <span className="text-slate-400">Total a pagar hoy</span>
            <span className="text-lg font-semibold text-slate-100">
              {formatComercioPrice(selected.price, selected.currency)}
            </span>
          </div>

          <Button
            size="md"
            rounded="md"
            colVariant="success"
            className="mt-4"
            disabled={paying}
            onClick={() => payMutation.mutate(selected.id)}
          >
            {paying ? "Procesando pago…" : "Pagar y activar"}
          </Button>

          <Text size="sm" className="mt-3 text-slate-500">
            Pago simulado: no se realiza ningún cobro real ni se envían datos a
            una pasarela. Queda registrado para la administración.
          </Text>
        </div>
      )}
    </div>
  );
}
