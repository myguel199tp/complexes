"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import DeliveryNav from "../_components/DeliveryNav";
import {
  DashboardBucket,
  SHIFT_LABELS,
  SHIFT_TONE,
  fmtMoney,
  getDeliverySummary,
} from "../services/deliveryOrdersService";

/**
 * "Hoy": lo que el repartidor lleva del día y de la semana.
 *
 * Quien reparte para dos o tres locales terminaba el día sin saber cuántas
 * entregas hizo para cada uno, cuánto efectivo traía de cada uno ni cuánto
 * había ganado. Todo eso ya estaba en la plataforma, repartido en pedidos que
 * él dejaba de ver al entregarlos.
 */
export default function DeliverySummaryPage() {
  const router = useRouter();
  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery_summary"],
    queryFn: getDeliverySummary,
    enabled: ready,
    refetchInterval: 60_000,
  });

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <DeliveryNav />

        <Title as="h1" size="md" colVariant="on" font="semi">
          Tu día
        </Title>

        {isLoading ? (
          <Text size="sm" className="mt-4 text-slate-400">
            Cargando...
          </Text>
        ) : error ? (
          <Text size="sm" colVariant="danger" className="mt-4">
            {(error as Error).message}
          </Text>
        ) : data ? (
          <>
            <Text size="sm" className="mt-1 text-slate-400">
              Turno:{" "}
              <span className={SHIFT_TONE[data.shiftStatus ?? "off"]}>
                {SHIFT_LABELS[data.shiftStatus ?? "off"]}
              </span>
              {data.active.total > 0 ? (
                <>
                  {" "}
                  ·{" "}
                  <Link href="/delivery/orders" className="text-cyan-300 underline">
                    {data.active.total} entrega
                    {data.active.total === 1 ? "" : "s"} en la mano
                  </Link>
                  {data.active.priority > 0
                    ? ` (${data.active.priority} directa${data.active.priority === 1 ? "" : "s"})`
                    : ""}
                </>
              ) : null}
            </Text>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Entregas hoy" value={String(data.today.delivered)} />
              <Stat
                label="Ganado hoy"
                value={fmtMoney(data.today.earned)}
                note={unpricedNote(data.today)}
              />
              <Stat
                label="Efectivo por entregar"
                value={fmtMoney(data.today.cash)}
                tone="text-amber-300"
              />
              <Stat
                label="No entregadas hoy"
                value={String(data.today.failed)}
                tone={data.today.failed > 0 ? "text-rose-300" : undefined}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat
                label="Entregas esta semana"
                value={String(data.week.delivered)}
              />
              <Stat
                label="Ganado esta semana"
                value={fmtMoney(data.week.earned)}
                note={unpricedNote(data.week)}
              />
            </div>

            <Text size="sm" font="semi" className="mt-8 text-slate-200">
              Por comercio
            </Text>
            <Text size="xs" className="text-slate-500">
              El efectivo es lo que cobraste en la puerta hoy y le entregas a
              cada local. Lo ganado sale de la tarifa que cada comercio
              registró; la plata te la paga el comercio, no la plataforma.
            </Text>

            {data.byComercio.length === 0 ? (
              <Text size="sm" className="mt-3 text-slate-400">
                Todavía no tienes entregas esta semana.
              </Text>
            ) : (
              <div className="mt-3 grid gap-3">
                {data.byComercio.map((row) => (
                  <div
                    key={row.comercioId}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <Text size="sm" font="semi" className="text-slate-100">
                      {row.comercioName ?? "Comercio"}
                    </Text>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <Mini label="Hoy" value={`${row.today.delivered} entregas`} />
                      <Mini label="Ganado hoy" value={fmtMoney(row.today.earned)} />
                      <Mini
                        label="Efectivo hoy"
                        value={fmtMoney(row.today.cash)}
                        tone={row.today.cash > 0 ? "text-amber-300" : undefined}
                      />
                      <Mini
                        label="Semana"
                        value={`${row.week.delivered} · ${fmtMoney(row.week.earned)}`}
                      />
                    </div>
                    {row.week.unpriced > 0 ? (
                      <Text size="xs" className="mt-2 text-slate-500">
                        {row.week.unpriced} entrega
                        {row.week.unpriced === 1 ? "" : "s"} sin tarifa
                        registrada: pídele al comercio que la ponga para verla
                        aquí.
                      </Text>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function unpricedNote(bucket: DashboardBucket) {
  return bucket.unpriced > 0
    ? `${bucket.unpriced} sin tarifa registrada`
    : undefined;
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Text size="xs" className="text-slate-400">
        {label}
      </Text>
      <p className={`mt-1 text-xl font-semibold ${tone ?? "text-slate-100"}`}>
        {value}
      </p>
      {note ? (
        <Text size="xs" className="text-slate-500">
          {note}
        </Text>
      ) : null}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={tone ?? "text-slate-200"}>{value}</p>
    </div>
  );
}
