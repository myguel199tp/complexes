"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { getDeliveries } from "../../deliveries/services/comercioDeliveryService";
import {
  DeliveryRun,
  MAX_STOPS_PER_RUN,
  RUN_STATUS_LABELS,
  RUN_STATUS_TONE,
  cancelDeliveryRun,
  createDeliveryRun,
  getDeliveryRuns,
  getRunCandidates,
} from "../services/deliveryRunsService";

const fmtTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

/** Pase que sirve ahora: sin revocar, sin usar y dentro de vigencia. */
function activePass(run: DeliveryRun) {
  const now = Date.now();

  return (
    (run.accessPasses ?? []).find(
      (pass) =>
        !pass.revoked && !pass.usedAt && new Date(pass.validTo).getTime() > now,
    ) ?? null
  );
}

/**
 * Armado de viajes de entrega.
 *
 * Un viaje agrupa varios pedidos del mismo conjunto en un recorrido y emite el
 * código con el que la portería deja entrar al repartidor. El backend llevaba
 * tiempo completo —entidades, validaciones, integración con visitas— y no tenía
 * cliente: era la funcionalidad más diferenciadora del B2C y no se podía usar.
 */
export default function ComercioDeliveryRunsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  useComercioGuard(() => router.push("/comercio/login"));

  const [deliveryId, setDeliveryId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Un viaje es de un solo conjunto, así que marcar pedidos queda encerrado en
  // el grupo que se empezó a marcar.
  const [lockedConjunto, setLockedConjunto] = useState<string | null>(null);

  const { data: deliveries } = useQuery({
    queryKey: ["comercio_deliveries"],
    queryFn: () => getDeliveries(),
  });

  const { data: runs, isLoading } = useQuery({
    queryKey: ["comercio_delivery_runs"],
    queryFn: () => getDeliveryRuns(),
  });

  const { data: candidates, isFetching: loadingCandidates } = useQuery({
    queryKey: ["comercio_run_candidates", deliveryId],
    queryFn: () => getRunCandidates(deliveryId),
    enabled: !!deliveryId,
  });

  const resetSelection = () => {
    setSelected(new Set());
    setLockedConjunto(null);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio_delivery_runs"] });
    queryClient.invalidateQueries({ queryKey: ["comercio_run_candidates"] });
    // Los pedidos del viaje dejan de estar disponibles para otro.
    queryClient.invalidateQueries({ queryKey: ["comercio_orders"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createDeliveryRun({ deliveryId, orderIds: [...selected] }),
    onSuccess: () => {
      showAlert(
        "Viaje creado. El repartidor ya puede ver el código de acceso.",
        "success",
      );
      resetSelection();
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelDeliveryRun(id),
    onSuccess: () => {
      showAlert("Viaje cancelado y código revocado", "success");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  function toggleOrder(orderId: string, conjuntoId: string) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(orderId)) {
        next.delete(orderId);
        if (next.size === 0) setLockedConjunto(null);
        return next;
      }

      if (next.size >= MAX_STOPS_PER_RUN) {
        showAlert(
          `Un viaje admite máximo ${MAX_STOPS_PER_RUN} paradas`,
          "error",
        );
        return prev;
      }

      setLockedConjunto(conjuntoId);
      next.add(orderId);
      return next;
    });
  }

  const activeDeliveries = (deliveries ?? []).filter((d) => d.isActive);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Viajes de entrega
          </Title>
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver
          </Link>
        </div>

        <Text size="sm" className="text-slate-400 mt-2">
          Agrupa hasta {MAX_STOPS_PER_RUN} pedidos del mismo conjunto en un
          recorrido. El viaje genera un código temporal con el que la portería
          deja entrar al repartidor, sin que tenga que anotarse en cada entrega.
        </Text>

        {/* ── Armar un viaje ── */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Text size="sm" font="semi" className="text-slate-200">
            Armar un viaje
          </Text>

          <select
            className="input-b2c mt-3"
            value={deliveryId}
            onChange={(e) => {
              setDeliveryId(e.target.value);
              // Los pedidos marcados eran de otro repartidor: mantenerlos
              // produciría un viaje que el backend rechaza.
              resetSelection();
            }}
          >
            <option value="">¿Quién lo lleva?</option>
            {activeDeliveries.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>

          {!deliveryId ? (
            <Text size="xs" className="text-slate-500 mt-2">
              Elige un repartidor para ver qué pedidos suyos se pueden agrupar.
            </Text>
          ) : loadingCandidates ? (
            <Text size="sm" className="text-slate-400 mt-3">
              Buscando pedidos...
            </Text>
          ) : candidates && candidates.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {candidates.map((group) => {
                // Cuando ya se marcó algo de otro conjunto, este grupo se
                // bloquea: es más honesto que dejar marcar y fallar al guardar.
                const blocked =
                  lockedConjunto !== null &&
                  lockedConjunto !== group.conjuntoId;

                return (
                  <div
                    key={group.conjuntoId}
                    className={`rounded-xl border p-3 ${
                      blocked
                        ? "border-white/5 bg-white/[0.01] opacity-50"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <Text size="sm" font="semi" className="text-slate-200">
                      {group.conjuntoName ?? "Conjunto"}
                    </Text>
                    {group.conjuntoAddress ? (
                      <Text size="xs" className="text-slate-500">
                        {group.conjuntoAddress}
                      </Text>
                    ) : null}

                    {blocked ? (
                      <Text size="xs" className="text-amber-300 mt-1">
                        Ya marcaste pedidos de otro conjunto. Un viaje es de un
                        solo conjunto.
                      </Text>
                    ) : null}

                    <div className="mt-2 grid gap-2">
                      {group.orders.map((order) => (
                        <label
                          key={order.id}
                          className={`flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2 ${
                            blocked ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-emerald-500"
                            disabled={blocked}
                            checked={selected.has(order.id)}
                            onChange={() =>
                              toggleOrder(order.id, group.conjuntoId)
                            }
                          />
                          <span className="min-w-0">
                            <span className="block text-sm text-slate-200">
                              ${order.totalAmount.toLocaleString("es-CO")} ·{" "}
                              {order.itemsCount} artículo
                              {order.itemsCount === 1 ? "" : "s"}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {order.deliveryAddress ?? "Sin dirección"}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  colVariant="success"
                  size="sm"
                  rounded="md"
                  disabled={selected.size === 0 || createMut.isLoading}
                  onClick={() => createMut.mutate()}
                >
                  {createMut.isLoading
                    ? "Creando..."
                    : `Crear viaje con ${selected.size} parada${
                        selected.size === 1 ? "" : "s"
                      }`}
                </Button>
                {selected.size > 0 ? (
                  <Button
                    colVariant="default"
                    size="sm"
                    rounded="md"
                    onClick={resetSelection}
                  >
                    Limpiar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <Text size="sm" className="text-slate-400 mt-3">
              Este repartidor no tiene pedidos agrupables. Asígnale pedidos
              desde{" "}
              <Link
                href="/comercio/orders"
                className="text-cyan-300 hover:text-cyan-200"
              >
                Pedidos
              </Link>{" "}
              y vuelve aquí.
            </Text>
          )}
        </div>

        {/* ── Viajes existentes ── */}
        <div className="mt-8 grid gap-3">
          <Text size="sm" font="semi" className="text-slate-200">
            Viajes
          </Text>

          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : runs && runs.length > 0 ? (
            runs.map((run) => {
              const pass = activePass(run);
              const pendingStops = run.stops.filter(
                (stop) => stop.status === "pending",
              ).length;

              return (
                <div
                  key={run.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Text size="sm" font="semi" className="text-slate-100">
                        {run.conjunto?.name ?? "Conjunto"}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {run.delivery?.fullName ?? "Repartidor"} ·{" "}
                        {run.stops.length} parada
                        {run.stops.length === 1 ? "" : "s"}
                        {pendingStops > 0
                          ? ` · ${pendingStops} por entregar`
                          : ""}
                      </Text>
                    </div>
                    <span className={`text-xs ${RUN_STATUS_TONE[run.status]}`}>
                      {RUN_STATUS_LABELS[run.status]}
                    </span>
                  </div>

                  {pass ? (
                    <Text size="xs" className="text-emerald-300 mt-2">
                      Código activo hasta las {fmtTime(pass.validTo)} · el
                      repartidor lo ve en su pantalla
                    </Text>
                  ) : run.status === "pending" ||
                    run.status === "in_progress" ? (
                    <Text size="xs" className="text-amber-300 mt-2">
                      Sin código vigente: el repartidor no podrá entrar.
                    </Text>
                  ) : null}

                  {run.status === "pending" || run.status === "in_progress" ? (
                    <Button
                      colVariant="danger"
                      size="xs"
                      rounded="md"
                      className="mt-3"
                      disabled={cancelMut.isLoading}
                      onClick={() => cancelMut.mutate(run.id)}
                    >
                      Cancelar viaje
                    </Button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <Text size="sm" className="text-slate-400">
              Aún no has armado viajes.
            </Text>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-b2c {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
