"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import { clearDeliveryToken, useDeliveryGuard } from "../_lib/delivery-auth";
import AccessPassCard from "../_components/AccessPassCard";
import HandoverDialog from "../_components/HandoverDialog";
import {
  ComercioOrderStatus,
  DeliveryHandover,
  DeliveryOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SHIFT_LABELS,
  SHIFT_TONE,
  ShiftStatus,
  collectPayment,
  getMyLinks,
  getMyRuns,
  getDeliveryProfile,
  getMyDeliveryOrders,
  markDelivered,
  markInTransit,
  reportDeliveryFailure,
  runForOrder,
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

  /**
   * Los viajes se cargan aquí y no sólo en su pantalla porque el código de
   * portería vive en el viaje, y el repartidor llega a la reja desde esta
   * pantalla. Tenerlo únicamente en "Mis viajes" —a la que había que saber ir—
   * era la razón por la que un pedido asignado llegaba sin nada que mostrarle
   * al celador.
   */
  const { data: runs } = useQuery({
    queryKey: ["delivery_runs"],
    queryFn: getMyRuns,
    enabled: ready,
    refetchInterval: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery_orders"] });
    // Entregar mueve también la parada del viaje: dejarlo sin refrescar hace
    // que la pantalla siga ofreciendo el código de un recorrido terminado.
    queryClient.invalidateQueries({ queryKey: ["delivery_runs"] });
    // Y su turno: libre u ocupado sale de las entregas que le quedan.
    queryClient.invalidateQueries({ queryKey: ["delivery_profile"] });
  };

  const transitMut = useMutation({
    mutationFn: (id: string) => markInTransit(id),
    onSuccess: invalidate,
  });

  /**
   * Qué pedido se está cerrando en la puerta y cómo: entregándolo (pide el
   * código) o reportando que no se pudo. El error vive aparte del de la
   * pantalla: un código equivocado se lee dentro del diálogo, que es donde se
   * vuelve a teclear.
   */
  const [handover, setHandover] = useState<{
    mode: "deliver" | "fail";
    orderId: string;
  } | null>(null);

  const closeHandover = () => setHandover(null);

  const deliveredMut = useMutation({
    mutationFn: (input: { id: string; handover: DeliveryHandover }) =>
      markDelivered(input.id, input.handover),
    onSuccess: () => {
      closeHandover();
      invalidate();
    },
  });

  const failMut = useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      reportDeliveryFailure(input.id, input.reason),
    onSuccess: () => {
      closeHandover();
      invalidate();
    },
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
    transitMut.isLoading ||
    deliveredMut.isLoading ||
    failMut.isLoading ||
    collectMut.isLoading;
  const error = transitMut.error ?? collectMut.error;
  const handoverError =
    handover?.mode === "fail" ? failMut.error : deliveredMut.error;

  const openHandover = (mode: "deliver" | "fail", orderId: string) => {
    deliveredMut.reset();
    failMut.reset();
    setHandover({ mode, orderId });
  };

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
              data-guide="delivery-runs"
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

        {/* Para quién trabaja, siempre visible y no sólo cuando son varios.
            Con un único comercio la pantalla no lo nombraba en ninguna parte
            fija: el repartidor abría la app y no sabía de qué negocio eran las
            entregas que miraba, y si no tenía pedidos tampoco si el vínculo
            existía. */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <Text size="xs" className="text-slate-400">
            Trabajas para
          </Text>

          {links === undefined ? (
            <Text size="sm" className="text-slate-500 mt-1">
              Cargando tus comercios...
            </Text>
          ) : links.length === 0 ? (
            <Text size="sm" className="text-amber-300 mt-1">
              Ningún comercio te tiene vinculado todavía. Sin vínculo no vas a
              recibir pedidos: pídele a tu comercio que te agregue a una sede.
            </Text>
          ) : (
            <div className="mt-1 grid gap-1">
              {links.map((link) => (
                <Text key={link.linkId} size="sm" className="text-slate-100">
                  {link.comercioName ?? "Comercio"}
                  {link.branchName ? (
                    <span className="text-slate-400"> · {link.branchName}</span>
                  ) : null}
                </Text>
              ))}
            </div>
          )}
        </div>

        {/* El turno arriba y siempre visible: es lo primero que hace al montar
            en la moto y lo último al bajarse, y de eso depende que el comercio
            sepa a quién asignarle. */}
        <div
          data-guide="delivery-shift"
          className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
        >
          <Text size="xs" className="text-slate-400">
            Tu turno ahora:{" "}
            <span className={SHIFT_TONE[profile?.shiftStatus ?? "off"]}>
              {SHIFT_LABELS[profile?.shiftStatus ?? "off"]}
              {profile?.shiftStatus === "busy" && profile.activeOrders
                ? ` · ${profile.activeOrders} entrega${
                    profile.activeOrders === 1 ? "" : "s"
                  }`
                : ""}
            </span>
          </Text>

          {/* Sólo se decide si se está en la calle o no. Libre u ocupado lo
              pone el sistema según las entregas que lleva: cuando se marcaba a
              mano, "ocupado" no se ponía nunca y el comercio asignaba a
              ciegas. */}
          <div className="mt-2 flex flex-wrap gap-2">
            {profile?.shiftStatus === "off" || !profile ? (
              <Button
                size="xs"
                rounded="md"
                colVariant="success"
                disabled={shiftMut.isLoading}
                onClick={() => shiftMut.mutate("available")}
              >
                Empezar turno
              </Button>
            ) : (
              <Button
                size="xs"
                rounded="md"
                colVariant="default"
                disabled={shiftMut.isLoading}
                onClick={() => shiftMut.mutate("off")}
              >
                Terminar turno
              </Button>
            )}
          </div>

          {/* No se puede terminar con entregas sin cerrar: el backend lo dice
              y aquí se lee. */}
          {shiftMut.error ? (
            <Text size="xs" colVariant="danger" className="mt-2">
              {(shiftMut.error as Error).message}
            </Text>
          ) : null}
        </div>

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
            pending.map((order: DeliveryOrder) => {
              const run = runForOrder(runs, order.id);

              return (
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

                {/* Un pedido agendado no es "lo antes posible": llegar antes
                    de la hora a un corte de pelo es tocar un timbre que nadie
                    espera todavía. */}
                {order.scheduledFor ? (
                  <Text size="sm" className="mt-2 font-semibold text-indigo-300">
                    📅 Para el{" "}
                    {new Date(order.scheduledFor).toLocaleString("es-CO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                ) : null}

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

                {/* Dónde recoger, antes de dónde entregar: el recorrido
                    empieza en el local. La dirección de la sede venía en la
                    respuesta y no se pintaba, así que quien reparte para varios
                    locales tenía que adivinarla. */}
                {order.branch?.address ? (
                  <Text size="sm" className="text-slate-300 mt-2">
                    🏪 Recoges en: {order.branch.address}
                  </Text>
                ) : null}

                {order.deliveryAddress ? (
                  <Text size="sm" className="text-slate-200 mt-1">
                    📍 Entregas en: {order.deliveryAddress}
                    {run?.conjunto?.name ? ` · ${run.conjunto.name}` : ""}
                  </Text>
                ) : null}

                {order.notes ? (
                  <Text size="xs" className="text-slate-400 mt-1">
                    Nota: {order.notes}
                  </Text>
                ) : null}

                {/* El código de portería, en el pedido que lo necesita. Existe
                    desde que asignar arma el viaje solo: antes había que
                    crearlo a mano desde el panel del comercio y nadie avisaba
                    de que ese paso faltaba. */}
                <div className="mt-3">
                  {run ? (
                    <AccessPassCard run={run} compact />
                  ) : (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
                      <Text size="xs" className="text-amber-200">
                        Este pedido todavía no tiene código de portería. Pídele
                        a tu comercio que arme el viaje desde su panel.
                      </Text>
                    </div>
                  )}
                </div>

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

                  {/* Una sola acción principal por pedido, según dónde esté:
                      salir con él o cerrarlo en la puerta. Cerrar abre el
                      diálogo del código: el botón solo no probaba que alguien
                      hubiera recibido nada. */}
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
                      onClick={() => openHandover("deliver", order.id)}
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

                {/* La salida para cuando la puerta no responde o el pedido no
                    puede llegar. Discreta y debajo: es la excepción. Antes no
                    existía, y el pedido se quedaba "en camino" para siempre o
                    se cerraba "sin código" con una excusa. */}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => openHandover("fail", order.id)}
                  className="mt-3 text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-50"
                >
                  No pude entregarlo
                </button>
              </div>
              );
            })
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

      <HandoverDialog
        mode={handover?.mode ?? "deliver"}
        open={!!handover}
        busy={deliveredMut.isLoading || failMut.isLoading}
        error={handoverError ? (handoverError as Error).message : null}
        onCancel={closeHandover}
        onDeliver={(input) =>
          handover && deliveredMut.mutate({ id: handover.orderId, handover: input })
        }
        onFail={(reason) =>
          handover && failMut.mutate({ id: handover.orderId, reason })
        }
      />
    </div>
  );
}
