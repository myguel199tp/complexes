"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import DeliveryNav from "../_components/DeliveryNav";
import {
  PAYMENT_METHOD_LABELS,
  fmtMoney,
  getDeliveryHistory,
  getMyLinks,
} from "../services/deliveryOrdersService";

/** `YYYY-MM-DD` de hoy menos `days`, en Colombia. */
function colombiaDay(daysAgo = 0) {
  const now = new Date(Date.now() - 5 * 3600 * 1000 - daysAgo * 86400 * 1000);
  return now.toISOString().slice(0, 10);
}

const RANGES = [
  { id: "today", label: "Hoy", from: () => colombiaDay(0) },
  { id: "7", label: "7 días", from: () => colombiaDay(6) },
  { id: "30", label: "30 días", from: () => colombiaDay(29) },
  { id: "90", label: "90 días", from: () => colombiaDay(89) },
] as const;

/**
 * Historial del repartidor: lo entregado y lo que no se pudo, con lo ganado.
 *
 * Antes lo entregado se veía solo en "Cerrados hoy", sin fecha ni comercio, y
 * lo que no se pudo entregar desaparecía de la lista —el pedido vuelve al
 * comercio sin repartidor—. Aquí está todo, filtrable por comercio.
 */
export default function DeliveryHistoryPage() {
  const router = useRouter();
  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("7");
  const [comercioId, setComercioId] = useState("");

  const from = useMemo(
    () => RANGES.find((r) => r.id === range)!.from(),
    [range],
  );
  const to = colombiaDay(0);

  const { data: links } = useQuery({
    queryKey: ["delivery_links"],
    queryFn: getMyLinks,
    enabled: ready,
  });

  const comercios = useMemo(() => {
    const map = new Map<string, string>();
    for (const link of links ?? []) {
      map.set(link.comercioId, link.comercioName ?? "Comercio");
    }
    return [...map.entries()];
  }, [links]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery_history", from, to, comercioId],
    queryFn: () =>
      getDeliveryHistory({ from, to, comercioId: comercioId || undefined }),
    enabled: ready,
  });

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <DeliveryNav />

        <Title as="h1" size="md" colVariant="on" font="semi">
          Historial
        </Title>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`rounded-full px-3 py-1 text-sm ${
                range === r.id
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "border border-white/10 text-slate-400"
              }`}
            >
              {r.label}
            </button>
          ))}

          {comercios.length > 1 ? (
            <select
              value={comercioId}
              onChange={(e) => setComercioId(e.target.value)}
              className="ml-auto rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-slate-200"
            >
              <option value="">Todos los comercios</option>
              {comercios.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

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
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Total label="Entregadas" value={String(data.totals.delivered)} />
              <Total label="No entregadas" value={String(data.totals.failed)} />
              <Total label="Ganado" value={fmtMoney(data.totals.earned)} />
            </div>
            {data.totals.unpriced > 0 ? (
              <Text size="xs" className="mt-2 text-slate-500">
                {data.totals.unpriced} entrega
                {data.totals.unpriced === 1 ? "" : "s"} sin tarifa registrada
                no suma{data.totals.unpriced === 1 ? "" : "n"} en lo ganado.
              </Text>
            ) : null}

            <div className="mt-4 grid gap-2">
              {data.rows.length === 0 ? (
                <Text size="sm" className="text-slate-400">
                  No hay entregas en este rango.
                </Text>
              ) : (
                data.rows.map((row) => (
                  <div
                    key={`${row.kind}-${row.orderId}-${row.at}`}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Text size="sm" className="text-slate-100">
                          {row.comercioName ?? "Comercio"}
                          {row.branchName ? (
                            <span className="text-slate-400"> · {row.branchName}</span>
                          ) : null}
                          {row.isPriority ? (
                            <span className="ml-1 text-xs text-rose-300">⚡ directa</span>
                          ) : null}
                        </Text>
                        <Text size="xs" className="text-slate-400">
                          {row.conjuntoName ?? "Conjunto"}
                          {row.deliveryAddress ? ` · ${row.deliveryAddress}` : ""}
                        </Text>
                        <Text size="xs" className="text-slate-500">
                          {new Date(row.at).toLocaleString("es-CO", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {fmtMoney(row.totalAmount)}
                          {row.collectedByMe && row.paymentMethod
                            ? ` · ${
                                row.paymentMethod === "contraentrega_efectivo"
                                  ? "cobraste en efectivo"
                                  : "cobraste con datáfono"
                              }`
                            : row.paymentMethod === "transferencia"
                              ? ` · ${PAYMENT_METHOD_LABELS.transferencia.toLowerCase()}`
                              : ""}
                        </Text>
                        {row.failureReason ? (
                          <Text size="xs" className="text-amber-300">
                            Motivo: {row.failureReason}
                          </Text>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-xs font-semibold ${
                            row.kind === "delivered"
                              ? "text-emerald-400"
                              : "text-amber-300"
                          }`}
                        >
                          {row.kind === "delivered" ? "Entregada" : "No se pudo"}
                        </p>
                        {row.kind === "delivered" ? (
                          <p className="text-xs text-slate-300">
                            {row.payAmount === null
                              ? "sin tarifa"
                              : `+${fmtMoney(row.payAmount)}`}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
