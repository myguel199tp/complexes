"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import { clearDeliveryToken, useDeliveryGuard } from "../_lib/delivery-auth";
import {
  ComercioOrderStatus,
  DeliveryOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SHIFT_LABELS,
  SHIFT_TONE,
  ShiftStatus,
  collectPayment,
  getMyLinks,
  getDeliveryProfile,
  getMyDeliveryOrders,
  markDelivered,
  markInTransit,
  setShift,
} from "../services/deliveryOrdersService";

const STATUS_TONE: Record<ComercioOrderStatus, string> = {
  pending: "text-slate-400",
  confirmed: "text-slate-400",
  assigned: "text-amber-300",
  in_transit: "text-blue-300",
  delivered: "text-emerald-400",
  cancelled: "text-slate-500",
};

/**
 * Pedidos asignados al repartidor.
 *
 * Es la pantalla que faltaba para que el ciclo del pedido pudiera cerrarse: el
 * backend sólo deja pasar a `in_transit` y `delivered` con el token del
 * repartidor, así que sin ella ningún pedido llegaba nunca a entregado por más
 * que el comercio lo despachara.
 *
 * Se diseña para la calle: una sola acción visible por pedido, botones grandes
 * y la dirección y el teléfono a un toque. Quien la usa va en moto.
 */
export default function DeliveryOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const { data: profile } = useQuery({
    queryKey: ["delivery_profile"],
    queryFn: getDeliveryProfile,
    enabled: ready,
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["delivery_orders"],
    queryFn: () => getMyDeliveryOrders(),
    enabled: ready,
    // La lista se refresca sola: el comercio puede asignar un pedido mientras
    // el repartidor tiene la pantalla abierta y nadie va a estar recargándola.
    refetchInterval: 60_000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["delivery_orders"] });

  const transitMut = useMutation({
    mutationFn: (id: string) => markInTransit(id),
    onSuccess: invalidate,
  });

  const deliveredMut = useMutation({
    mutationFn: (id: string) => markDelivered(id),
    onSuccess: invalidate,
  });

  const collectMut = useMutation({
    mutationFn: (id: string) => collectPayment(id),
    onSuccess: invalidate,
  });

  // Comercios donde trabaja. Se consulta aunque no se muestre siempre: sirve
  // para decirle que no está vinculado a ninguno, que es un vacío distinto de
  // "no tienes entregas hoy".
  const { data: links } = useQuery({
    queryKey: ["delivery_links"],
    queryFn: getMyLinks,
    enabled: ready,
  });

  const shiftMut = useMutation({
    mutationFn: (status: ShiftStatus) => setShift(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery_profile"] });
    },
  });

  const handleLogout = async () => {
    await clearDeliveryToken();
    router.push("/delivery/login");
  };

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  // Lo que le queda por hacer va primero; lo entregado se consulta abajo. Un
  // repartidor abre esto para saber qué sigue, no para revisar su historial.
  const pending = (orders ?? []).filter(
    (order) => order.status === "assigned" || order.status === "in_transit",
  );
  const done = (orders ?? []).filter(
    (order) => order.status === "delivered" || order.status === "cancelled",
  );

  const isBusy =
    transitMut.isLoading || deliveredMut.isLoading || collectMut.isLoading;
  const error =
    transitMut.error ?? deliveredMut.error ?? collectMut.error;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Title as="h1" size="md" colVariant="on" font="semi">
              Mis entregas
            </Title>
            <Text size="sm" className="mt-1 text-slate-500">
              {profile?.fullName ?? session.email}
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/delivery/runs"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Mis viajes →
            </Link>
            <Button
              colVariant="danger"
              size="xs"
              rounded="md"
              onClick={handleLogout}
            >
              Salir
            </Button>
          </div>
        </div>

        {/* El turno arriba y siempre visible: es lo primero que hace al montar
            en la moto y lo último al bajarse, y de eso depende que el comercio
            sepa a quién asignarle. */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <Text size="xs" className="text-slate-400">
            Tu turno ahora:{" "}
            <span className={SHIFT_TONE[profile?.shiftStatus ?? "off"]}>
              {SHIFT_LABELS[profile?.shiftStatus ?? "off"]}
            </span>
          </Text>

          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SHIFT_LABELS) as ShiftStatus[]).map((status) => (
              <Button
                key={status}
                size="xs"
                rounded="md"
                colVariant={
                  profile?.shiftStatus === status ? "primary" : "default"
                }
                disabled={shiftMut.isLoading}
                onClick={() => shiftMut.mutate(status)}
              >
                {SHIFT_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>

        {links && links.length > 1 ? (
          <Text size="xs" className="text-slate-500 mt-2">
            Repartes para {links.map((l) => l.comercioName).join(", ")}.
          </Text>
        ) : null}

        {error ? (
          <Text size="sm" colVariant="danger" className="mt-4">
            {(error as Error).message}
          </Text>
        ) : null}

        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : pending.length > 0 ? (
            pending.map((order: DeliveryOrder) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <Text size="sm" font="semi" className="text-slate-100">
                      ${Number(order.totalAmount).toLocaleString("es-CO")}
                    </Text>
                    {/* De dónde se recoge. Con varios comercios, saber el
                        monto sin saber el local no sirve de nada. */}
                    {order.comercio ? (
                      <Text size="xs" className="text-cyan-300">
                        {order.comercio.businessName}
                        {order.branch?.name ? ` · ${order.branch.name}` : ""}
                      </Text>
                    ) : null}
                  </div>
                  <span className={`text-xs ${STATUS_TONE[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <Text size="xs" className="text-slate-400 mt-1">
                  {order.items
                    .map((item) => `${item.quantity}× ${item.nameSnapshot}`)
                    .join(", ")}
                </Text>

                {/* Cuánto hay que cobrar, en la tarjeta: es lo que el
                    repartidor necesita saber antes de tocar el timbre. */}
                <Text
                  size="sm"
                  className={
                    order.paymentStatus === "paid"
                      ? "text-emerald-400 mt-2"
                      : "text-amber-300 mt-2"
                  }
                >
                  {order.paymentStatus === "paid"
                    ? "✓ Ya está pagado, no cobres"
                    : `${PAYMENT_METHOD_LABELS[order.paymentMethod]} · $${Number(
                        order.totalAmount,
                      ).toLocaleString("es-CO")}`}
                </Text>

                {order.deliveryAddress ? (
                  <Text size="sm" className="text-slate-200 mt-2">
                    📍 {order.deliveryAddress}
                  </Text>
                ) : null}

                {order.notes ? (
                  <Text size="xs" className="text-slate-400 mt-1">
                    Nota: {order.notes}
                  </Text>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* El teléfono como enlace `tel:`: en la calle se toca, no se
                      copia. */}
                  {order.contactPhone ? (
                    <a
                      href={`tel:${order.contactPhone}`}
                      className="rounded-md border border-white/10 px-3 py-2 text-sm text-cyan-300"
                    >
                      Llamar {order.contactPhone}
                    </a>
                  ) : null}

                  {/* Una sola acción por pedido: el backend sólo admite
                      `in_transit` desde asignado y `delivered` desde en camino,
                      así que ofrecer las dos invitaría a un error garantizado. */}
                  {order.status === "assigned" ? (
                    <Button
                      colVariant="primary"
                      size="md"
                      rounded="md"
                      disabled={isBusy}
                      onClick={() => transitMut.mutate(order.id)}
                    >
                      Salí a entregar
                    </Button>
                  ) : (
                    <Button
                      colVariant="success"
                      size="md"
                      rounded="md"
                      disabled={isBusy}
                      onClick={() => deliveredMut.mutate(order.id)}
                    >
                      Entregado
                    </Button>
                  )}

                  {/* Cobrar va aparte de entregar: se puede cobrar antes de
                      marcar la entrega, y forzar un solo botón obligaría a
                      elegir un orden que en la puerta no siempre se cumple. */}
                  {order.paymentMethod !== "transferencia" &&
                  order.paymentStatus !== "paid" ? (
                    <Button
                      colVariant="default"
                      size="md"
                      rounded="md"
                      disabled={isBusy}
                      onClick={() => collectMut.mutate(order.id)}
                    >
                      Ya cobré
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <Text size="sm" className="text-slate-400">
              No tienes entregas pendientes. Cuando tu comercio te asigne un
              pedido aparecerá aquí.
            </Text>
          )}
        </div>

        {done.length > 0 ? (
          <div className="mt-8">
            <Text size="sm" font="semi" className="text-slate-300">
              Cerrados hoy
            </Text>
            <div className="mt-2 grid gap-2">
              {done.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <Text size="xs" className="text-slate-400">
                    ${Number(order.totalAmount).toLocaleString("es-CO")}
                    {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
                  </Text>
                  <span className={`text-xs ${STATUS_TONE[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
