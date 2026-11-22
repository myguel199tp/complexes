"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "complexes-next-components";

import { Button } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { formatCurrency } from "@/app/_helpers/format-currency";
import {
  isAwaitingPayment,
  PlatformCharge,
  PlatformChargesApi,
} from "@/app/components/platform-charge/platform-charge-api";
import PlatformChargePanel, {
  PendingPlatformCharges,
} from "@/app/components/platform-charge/platform-charge-panel";

import {
  formatDay,
  UsageCreditOffer,
  UsageCreditsApi,
  UsageCreditsSummary,
} from "./usage-credits-api";

interface Props {
  api: UsageCreditsApi;
  chargesApi: PlatformChargesApi;
  title: string;
  /** Una línea de qué es y cuándo se gasta. */
  description: string;
  /** "dark" en el panel del comercio; "auto" sigue el tema claro/oscuro. */
  tone?: "auto" | "dark";
}

/**
 * Lo gratis del mes, lo que queda de los paquetes y los paquetes a la venta.
 * La usan la administración (Lary y WhatsApp) y el comercio (avisos).
 */
export default function UsageCreditsCard({
  api,
  chargesApi,
  title,
  description,
  tone = "auto",
}: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [confirming, setConfirming] = useState<UsageCreditOffer | null>(null);
  const [awaiting, setAwaiting] = useState<PlatformCharge | null>(null);

  const { data, isLoading, error } = useQuery<UsageCreditsSummary, Error>({
    queryKey: api.key,
    queryFn: api.get,
    retry: false,
  });

  const purchase = useMutation({
    mutationFn: (offer: UsageCreditOffer) => api.purchase(offer.id),
    onSuccess: (result, offer) => {
      setConfirming(null);
      if (isAwaitingPayment(result)) {
        // Con Bre-B el paquete se suma cuando soporte verifica el pago.
        queryClient.invalidateQueries(["platform-charges"]);
        setAwaiting(result.charge);
        return;
      }
      queryClient.setQueryData(api.key, result);
      showAlert(`Listo: sumaste ${offer.credits} ${result.unit}.`, "success");
    },
    onError: (err: Error) => showAlert(err.message, "error"),
  });

  const dark = tone === "dark";
  const box = dark
    ? "rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-slate-100"
    : "rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  const muted = dark ? "text-slate-400" : "text-gray-600 dark:text-slate-400";
  const inner = dark
    ? "rounded-xl border border-white/10 bg-white/[0.04] p-3"
    : "rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800";

  if (isLoading) {
    return (
      <div className={box}>
        <p className={`text-sm ${muted}`}>Cargando {title.toLowerCase()}…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={box}>
        <p className="font-semibold">{title}</p>
        <p className={`mt-1 text-sm ${muted}`}>
          {error?.message ?? "No se pudo consultar."}
        </p>
      </div>
    );
  }

  const usedPct =
    data.freeLimit > 0 ? Math.min(100, (data.freeUsed / data.freeLimit) * 100) : 100;

  return (
    <div className={box}>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        <p className={`text-sm ${muted}`}>{description}</p>
      </div>

      <div className="mt-4">
        <PendingPlatformCharges
          api={chargesApi}
          concept="usage_credits"
          tone={dark ? "dark" : "auto"}
          title="Paquetes por pagar"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={inner}>
          <p className={`text-xs ${muted}`}>Gratis este mes</p>
          <p className="mt-1 text-lg font-semibold">
            {data.freeLimit > 0
              ? `${data.freeRemaining} de ${data.freeLimit}`
              : "Tu plan no trae"}
          </p>
          {data.freeLimit > 0 && (
            <div
              className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-gray-200 dark:bg-slate-700"}`}
            >
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${usedPct}%` }}
              />
            </div>
          )}
          <p className={`mt-2 text-xs ${muted}`}>
            Se renueva el {formatDay(data.resetsAt)}.
          </p>
        </div>

        <div className={inner}>
          <p className={`text-xs ${muted}`}>De tus paquetes</p>
          <p className="mt-1 text-lg font-semibold">{data.creditsRemaining}</p>
          {data.packages.length > 0 ? (
            <ul className={`mt-2 flex flex-col gap-0.5 text-xs ${muted}`}>
              {data.packages.map((pkg) => (
                <li key={pkg.id}>
                  {pkg.name}: quedan {pkg.remaining} · vence el{" "}
                  {formatDay(pkg.endsAt)}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-2 text-xs ${muted}`}>Sin paquetes vigentes.</p>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold">Paquetes</p>
      {data.offers.length === 0 ? (
        <p className={`mt-1 text-sm ${muted}`}>
          No hay paquetes a la venta por ahora.
        </p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.offers.map((offer) => (
            <div key={offer.id} className={`${inner} flex flex-col`}>
              <p className="text-sm font-semibold">{offer.name}</p>
              <p className={`text-xs ${muted}`}>
                +{offer.credits} {data.unit}, para usar en {offer.durationDays}{" "}
                días
              </p>
              <p className="mt-2 text-sm font-semibold">
                {formatCurrency(offer.total)}{" "}
                <span className={`text-xs font-normal ${muted}`}>con IVA</span>
              </p>
              <Button
                size="sm"
                colVariant="success"
                className="mt-3"
                disabled={purchase.isLoading}
                onClick={() => setConfirming(offer)}
              >
                Comprar
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        title="Comprar paquete"
        className="!w-[94%] md:!w-[440px] max-w-[96vw]"
      >
        {confirming && (
          <div className="flex flex-col gap-3 text-sm text-gray-800">
            <p>
              <strong>{confirming.name}</strong>: {confirming.credits}{" "}
              {data.unit} para usar en {confirming.durationDays} días. Se gastan
              cuando se acaba lo gratis del mes.
            </p>
            <p>
              {formatCurrency(confirming.price)} + IVA ={" "}
              <strong>{formatCurrency(confirming.total)}</strong>
            </p>
            {data.simulated && (
              <p className="text-xs text-gray-500">
                Pago simulado: no se cobra dinero real todavía.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" colVariant="default" onClick={() => setConfirming(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                colVariant="success"
                disabled={purchase.isLoading}
                onClick={() => purchase.mutate(confirming)}
              >
                {purchase.isLoading ? "Comprando…" : "Comprar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!awaiting}
        onClose={() => setAwaiting(null)}
        title="Paga el paquete por Bre-B"
        className="!w-[94%] md:!w-[520px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
      >
        {awaiting && (
          <PlatformChargePanel
            charge={awaiting}
            api={chargesApi}
            tone="light"
            onChanged={(charge) => setAwaiting(charge)}
          />
        )}
      </Modal>
    </div>
  );
}
