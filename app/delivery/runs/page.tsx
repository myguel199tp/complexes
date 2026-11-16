"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import AccessPassCard from "../_components/AccessPassCard";
import DeliveryNav from "../_components/DeliveryNav";
import HandoverDialog from "../_components/HandoverDialog";
import NavigateButtons from "../_components/NavigateButtons";
import {
  DeliveryHandover,
  getMyRuns,
  legsOf,
  markStopDelivered,
  reportStopFailure,
} from "../services/deliveryOrdersService";

const fmtTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

/**
 * Viajes del repartidor: el recorrido, conjunto por conjunto, con el código
 * con el que entra a cada uno.
 *
 * Un viaje ya no es de un solo conjunto. Quien llevaba pedidos a dos edificios
 * tenía dos viajes sueltos y ninguna forma de verlos como el recorrido que
 * hacía; ahora es uno, con los conjuntos que faltan en el orden sugerido desde
 * el local y un QR por portería.
 */
export default function DeliveryRunsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const { data: runs, isLoading } = useQuery({
    queryKey: ["delivery_runs"],
    queryFn: getMyRuns,
    enabled: ready,
    refetchInterval: 60_000,
  });

  const [handover, setHandover] = useState<{
    mode: "deliver" | "fail";
    runId: string;
    stopId: string;
  } | null>(null);

  const afterStop = () => {
    setHandover(null);
    queryClient.invalidateQueries({ queryKey: ["delivery_runs"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_orders"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_profile"] });
  };

  const stopMut = useMutation({
    mutationFn: (input: {
      runId: string;
      stopId: string;
      handover: DeliveryHandover;
    }) => markStopDelivered(input.runId, input.stopId, input.handover),
    onSuccess: afterStop,
  });

  const failMut = useMutation({
    mutationFn: (input: { runId: string; stopId: string; reason: string }) =>
      reportStopFailure(input.runId, input.stopId, input.reason),
    onSuccess: afterStop,
  });

  const openHandover = (
    mode: "deliver" | "fail",
    runId: string,
    stopId: string,
  ) => {
    stopMut.reset();
    failMut.reset();
    setHandover({ mode, runId, stopId });
  };

  const handoverError =
    handover?.mode === "fail" ? failMut.error : stopMut.error;
  const stopBusy = stopMut.isLoading || failMut.isLoading;

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <DeliveryNav />

        <Title as="h1" size="md" colVariant="on" font="semi">
          Mis viajes
        </Title>

        <Text size="sm" className="mt-1 text-slate-500">
          Un viaje junta los pedidos que llevas de un mismo comercio, aunque
          vayan a conjuntos distintos. Cada conjunto tiene su propio código de
          portería.
        </Text>

        <div className="mt-6 grid gap-4">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : runs && runs.length > 0 ? (
            runs.map((run) => {
              const legs = legsOf(run);
              const pendingStops = run.stops.filter(
                (stop) => stop.status === "pending",
              );
              const pendingLegs = legs.filter((leg) => leg.pendingStops > 0);

              return (
                <div
                  key={run.id}
                  className={`rounded-2xl border p-4 ${
                    run.isPriority
                      ? "border-rose-400/40 bg-rose-500/[0.07]"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {run.isPriority ? (
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-200">
                      ⚡ Entrega directa · sin otras paradas
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Text size="sm" font="semi" className="text-slate-100">
                        {run.comercioName ?? "Viaje"}
                        {run.origin?.name ? (
                          <span className="text-slate-400">
                            {" "}
                            · sale de {run.origin.name}
                          </span>
                        ) : null}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {legs.length} conjunto{legs.length === 1 ? "" : "s"} ·{" "}
                        {pendingStops.length} por entregar de{" "}
                        {run.stops.length}
                      </Text>
                    </div>
                  </div>

                  {/* El recorrido de un vistazo: qué conjunto sigue. */}
                  {pendingLegs.length > 1 ? (
                    <ol className="mt-3 flex flex-wrap items-center gap-1 text-xs text-slate-300">
                      {pendingLegs.map((leg, index) => (
                        <li key={leg.conjuntoId} className="flex items-center gap-1">
                          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-cyan-200">
                            {index + 1}. {leg.conjuntoName ?? "Conjunto"}
                          </span>
                          {index < pendingLegs.length - 1 ? (
                            <span className="text-slate-500">→</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  <div className="mt-4 grid gap-4">
                    {legs.map((leg, index) => (
                      <div
                        key={leg.conjuntoId}
                        className="rounded-xl border border-white/10 bg-black/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <Text size="sm" font="semi" className="text-slate-100">
                              {leg.pendingStops > 0 && legs.length > 1
                                ? `${index + 1}. `
                                : ""}
                              {leg.conjuntoName ?? "Conjunto"}
                            </Text>
                            {leg.conjuntoAddress ? (
                              <Text size="xs" className="text-slate-400">
                                {leg.conjuntoAddress}
                              </Text>
                            ) : null}
                          </div>
                          <Text size="xs" className="text-slate-400">
                            {leg.pendingStops > 0
                              ? `${leg.pendingStops} por entregar`
                              : "Terminado"}
                          </Text>
                        </div>

                        {leg.pendingStops > 0 ? (
                          <>
                            <NavigateButtons
                              place={{
                                latitude: leg.latitude,
                                longitude: leg.longitude,
                                address: [leg.conjuntoAddress, leg.conjuntoCity]
                                  .filter(Boolean)
                                  .join(", "),
                              }}
                              label="al conjunto"
                            />
                            {/* El QR arriba y en grande: es lo que se muestra
                                frente a la portería con el celular en una mano. */}
                            <div className="mt-3">
                              <AccessPassCard run={run} leg={leg} />
                            </div>
                          </>
                        ) : null}

                        <div className="mt-3 grid gap-2">
                          {leg.stops.map((stop) => (
                            <div
                              key={stop.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 flex-wrap"
                            >
                              <div className="min-w-0">
                                <Text size="sm" className="text-slate-200">
                                  {stop.deliveryAddress ?? "Sin dirección"}
                                </Text>
                                {stop.status === "delivered" ? (
                                  <Text size="xs" className="text-emerald-400">
                                    Entregada {fmtTime(stop.deliveredAt)}
                                  </Text>
                                ) : stop.status === "revoked" ? (
                                  <Text size="xs" className="text-slate-500">
                                    Anulada
                                  </Text>
                                ) : stop.status === "failed" ? (
                                  <Text size="xs" className="text-amber-300">
                                    No se pudo entregar
                                  </Text>
                                ) : null}
                              </div>

                              {stop.status === "pending" ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    disabled={stopBusy}
                                    onClick={() =>
                                      openHandover("fail", run.id, stop.id)
                                    }
                                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-50"
                                  >
                                    No pude
                                  </button>
                                  <Button
                                    colVariant="success"
                                    size="sm"
                                    rounded="md"
                                    disabled={stopBusy}
                                    onClick={() =>
                                      openHandover("deliver", run.id, stop.id)
                                    }
                                  >
                                    Entregada
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <Text size="sm" className="text-slate-400">
              No tienes viajes activos. Se arman solos cuando un comercio te
              asigna pedidos.
            </Text>
          )}
        </div>
      </div>

      <HandoverDialog
        mode={handover?.mode ?? "deliver"}
        open={!!handover}
        busy={stopBusy}
        error={handoverError ? (handoverError as Error).message : null}
        onCancel={() => setHandover(null)}
        onDeliver={(input) =>
          handover &&
          stopMut.mutate({
            runId: handover.runId,
            stopId: handover.stopId,
            handover: input,
          })
        }
        onFail={(reason) =>
          handover &&
          failMut.mutate({
            runId: handover.runId,
            stopId: handover.stopId,
            reason,
          })
        }
      />
    </div>
  );
}
