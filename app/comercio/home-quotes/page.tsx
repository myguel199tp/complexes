"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";

import { useComercioGuard } from "../_lib/comercio-auth";
import { getHomeQuoteChannel } from "./services/homeQuotesService";
import { ChannelSettings } from "./_components/channel-settings";
import { PlanCard } from "./_components/plan-card";
import { RequestsInbox } from "./_components/requests-inbox";

type Tab = "requests" | "channel" | "plan";

const TABS: { value: Tab; label: string }[] = [
  { value: "requests", label: "Solicitudes" },
  { value: "channel", label: "Mi canal" },
  { value: "plan", label: "Plan y cobertura" },
];

/**
 * Cotizaciones de obra: el segundo canal B2C. Los residentes piden cotización
 * de trabajos en su apartamento (pisos, cocinas, carpintería…) y el negocio
 * responde con visita, precio y cuadrilla.
 *
 * No depende de la tienda: no hay carrito ni domicilios ni suscripción por
 * conjunto, y llega por ciudades de cobertura en vez de 40 km.
 */
export default function ComercioHomeQuotesPage() {
  const router = useRouter();
  useComercioGuard(() => router.push("/comercio/login"));

  const channelQuery = useQuery({
    queryKey: ["comercio_home_quote_channel"],
    queryFn: getHomeQuoteChannel,
  });
  const channel = channelQuery.data;

  // Sin canal configurado la primera pantalla útil es configurarlo.
  const [tab, setTab] = useState<Tab | null>(null);
  const current: Tab = tab ?? (channel && !channel.profile.enabled ? "channel" : "requests");

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Title as="h1" size="xs" colVariant="on" font="semi">
            Cotizaciones de obra
          </Title>
          <Text size="sm" className="mt-1 text-slate-400">
            Para trabajos que se cotizan en el apartamento: pisos, cocinas,
            carpintería, pintura… Los residentes de tus ciudades te encuentran en
            &quot;Servicios para tu hogar&quot;, te piden cotización y tú
            respondes con visita, precio y cuadrilla. No necesita tienda ni
            suscripción por conjunto.
          </Text>
        </div>

        {channelQuery.isError && (
          <Text size="sm" colVariant="danger">
            {(channelQuery.error as Error).message}
          </Text>
        )}

        {channel && !channel.profile.enabled && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
            <Text size="sm" className="text-amber-200">
              Tu canal está apagado. Elige tus oficios y ciudades en &quot;Mi
              canal&quot;, actívalo y paga la cobertura para empezar a recibir
              solicitudes.
            </Text>
          </div>
        )}

        {channel?.profile.enabled && !channel.plan.active && (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
            <Text size="sm" className="text-amber-200">
              Tu canal está activo pero sin plan vigente: los residentes no te
              ven. Paga tu cobertura en &quot;Plan y cobertura&quot;.
            </Text>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                current === item.value
                  ? "bg-purple-500/30 text-purple-100"
                  : "bg-white/[0.06] text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {current === "requests" && <RequestsInbox />}
        {current === "channel" && channel && <ChannelSettings channel={channel} />}
        {current === "plan" && channel && <PlanCard channel={channel} />}
      </div>
    </div>
  );
}
