"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import AccessPassCard from "../_components/AccessPassCard";
import { getMyRuns, markStopDelivered } from "../services/deliveryOrdersService";

const fmtTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

/**
 * Viajes del repartidor: las paradas de un recorrido y el código con el que
 * entra al conjunto.
 *
 * El código es lo que justifica la pantalla. Se emitía al crear el viaje y sólo
 * se le devolvía al comercio, así que la única persona que tenía que leerlo en
 * la portería era la única que no podía verlo.
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

  const stopMut = useMutation({
    mutationFn: (input: { runId: string; stopId: string }) =>
      markStopDelivered(input.runId, input.stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_runs"] });
      // Marcar la parada entrega el pedido: la otra pantalla queda desfasada.
      queryClient.invalidateQueries({ queryKey: ["delivery_orders"] });
    },
  });

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Mis viajes
          </Title>
          <Link
            href="/delivery/orders"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Mis entregas
          </Link>
        </div>

        <Text size="sm" className="mt-1 text-slate-500">
          Un viaje agrupa varias entregas del mismo conjunto y trae el código
          con el que te dejan entrar.
        </Text>

        {stopMut.error ? (
          <Text size="sm" colVariant="danger" className="mt-4">
            {(stopMut.error as Error).message}
          </Text>
        ) : null}

        <div className="mt-6 grid gap-4">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : runs && runs.length > 0 ? (
            runs.map((run) => {
              const pendingStops = run.stops.filter(
                (stop) => stop.status === "pending",
              );

              return (
                <div
                  key={run.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Text size="sm" font="semi" className="text-slate-100">
                        {run.conjunto?.name ?? "Conjunto"}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {run.stops.length} parada
                        {run.stops.length === 1 ? "" : "s"} ·{" "}
                        {pendingStops.length} por entregar
                      </Text>
                    </div>
                  </div>

                  {/* El QR arriba y en grande: es lo que se muestra de un
                      vistazo frente a la portería, con el celular en una mano.
                      Antes aquí sólo iba el código en texto y el celador
                      escanea con la cámara. */}
                  <div className="mt-3">
                    <AccessPassCard run={run} />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {run.stops.map((stop) => (
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
                          ) : null}
                        </div>

                        {stop.status === "pending" ? (
                          <Button
                            colVariant="success"
                            size="sm"
                            rounded="md"
                            disabled={stopMut.isLoading}
                            onClick={() =>
                              stopMut.mutate({ runId: run.id, stopId: stop.id })
                            }
                          >
                            Entregada
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <Text size="sm" className="text-slate-400">
              No tienes viajes activos. Tu comercio los arma agrupando varios
              pedidos del mismo conjunto.
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
