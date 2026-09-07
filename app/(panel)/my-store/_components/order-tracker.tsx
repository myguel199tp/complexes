"use client";

import { useEffect, useState } from "react";
import { Text } from "complexes-next-components";
import {
  IoBagCheckOutline,
  IoBicycleOutline,
  IoCallOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoHomeOutline,
  IoReceiptOutline,
  IoRestaurantOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";
import {
  MyOrder,
  getDeliveryPhoto,
} from "../services/comercioStoreService";

/**
 * Las etapas por las que pasa un pedido, en orden.
 *
 * `cancelled` no está aquí a propósito: no es un punto más de la línea sino su
 * interrupción, y meterlo como sexto paso sugeriría que cancelar es la meta.
 * Se dibuja aparte.
 */
const STAGES = [
  {
    key: "createdAt",
    title: "Pedido recibido",
    detail: "El comercio ya lo tiene en pantalla.",
    icon: IoReceiptOutline,
  },
  {
    key: "confirmedAt",
    title: "Confirmado",
    detail: "Aceptaron tu pedido y lo están preparando.",
    icon: IoRestaurantOutline,
  },
  {
    key: "assignedAt",
    title: "Repartidor asignado",
    detail: "Ya hay alguien encargado de traértelo.",
    icon: IoBagCheckOutline,
  },
  {
    key: "inTransitAt",
    title: "En camino",
    detail: "Salió del local hacia tu casa.",
    icon: IoBicycleOutline,
  },
  {
    key: "deliveredAt",
    title: "Entregado",
    detail: "El pedido llegó.",
    icon: IoHomeOutline,
  },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

/** Hora corta: en un pedido del día, la fecha sobra y la hora es el dato. */
function formatTime(value?: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Foto del repartidor.
 *
 * Se pide sólo cuando el pedido dice que la hay: el endpoint responde 404 en
 * cualquier otro caso —entregado, cancelado, sin asignar— y pedirla igual
 * llenaría la consola de errores esperados.
 */
function DeliveryAvatar({
  conjuntoId,
  orderId,
  name,
}: {
  conjuntoId: string;
  orderId: string;
  name: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;

    getDeliveryPhoto(conjuntoId, orderId)
      .then((objectUrl) => {
        revoked = objectUrl;
        setUrl(objectUrl);
      })
      .catch(() => undefined);

    return () => {
      // Sin esto el blob queda vivo en memoria hasta recargar la página, y la
      // lista de pedidos monta uno de estos por cada entrega en curso.
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [conjuntoId, orderId]);

  if (!url) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // `next/image` no sirve aquí: la fuente es un `blob:` creado en el
    // navegador, no una URL que el optimizador pueda ir a buscar.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Foto de ${name}`}
      className="h-11 w-11 rounded-full object-cover"
    />
  );
}

/**
 * El recorrido del pedido.
 *
 * Antes esta pantalla decía una palabra —"Asignado"— y nada más: ni cuándo
 * pasó, ni qué venía después, ni quién lo traía. La línea de etapas responde
 * las tres cosas de un vistazo, que es lo que alguien esperando comida mira
 * cada dos minutos.
 *
 * La etapa en curso se anima; las cumplidas quedan fijas con su hora. Sólo se
 * mueve una cosa a la vez a propósito: es una pantalla que se mira de reojo.
 */
export default function OrderTracker({
  order,
  conjuntoId,
}: {
  order: MyOrder;
  conjuntoId: string;
}) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-700">
          <IoCloseCircleOutline size={20} />
          <span className="text-sm font-semibold">Pedido cancelado</span>
          {formatTime(order.cancelledAt) ? (
            <span className="text-xs text-red-500">
              · {formatTime(order.cancelledAt)}
            </span>
          ) : null}
        </div>
        {order.cancelReason ? (
          <Text size="xs" className="mt-1 text-red-600">
            {order.cancelReason}
          </Text>
        ) : null}
      </div>
    );
  }

  // La etapa actual es la última con fecha. Se deriva de las marcas de tiempo
  // y no del campo `status` porque las dos cosas pueden desincronizarse, y las
  // fechas son las que además dan la hora de cada paso.
  const lastDone = STAGES.reduce(
    (acc, stage, index) => (order[stage.key as StageKey] ? index : acc),
    0,
  );

  const isFinished = !!order.deliveredAt;
  const courier = order.delivery;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <ol className="relative">
        {STAGES.map((stage, index) => {
          const time = formatTime(order[stage.key as StageKey]);
          const done = index <= lastDone;
          const current = index === lastDone && !isFinished;
          const Icon: IconType = stage.icon;

          return (
            <li key={stage.key} className="flex gap-3 pb-5 last:pb-0">
              {/* Columna del icono y la línea que une las etapas. */}
              <div className="relative flex flex-col items-center">
                <span
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-200 bg-white text-gray-300"
                  }`}
                >
                  {current ? (
                    // Halo que late: señala dónde está el pedido ahora sin
                    // tapar el icono ni mover el resto de la línea.
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
                  ) : null}
                  <Icon size={18} className="relative" />
                </span>

                {index < STAGES.length - 1 ? (
                  <span
                    className={`w-0.5 flex-1 transition-colors duration-500 ${
                      index < lastDone ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                ) : null}
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      done ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {stage.title}
                  </span>
                  {time ? (
                    <span className="text-xs text-gray-400">{time}</span>
                  ) : null}
                </div>

                {/* El detalle sólo en la etapa en curso: repetirlo en las cinco
                    convierte la línea en un muro de texto. */}
                {current || (isFinished && index === STAGES.length - 1) ? (
                  <Text size="xs" className="mt-0.5 text-gray-500">
                    {stage.detail}
                  </Text>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Quién lo trae. Aparece con la asignación y se va con la entrega:
          después ya no hay a quién reconocer. */}
      {courier && !isFinished ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          {courier.hasPhoto ? (
            <DeliveryAvatar
              conjuntoId={conjuntoId}
              orderId={order.id}
              name={courier.fullName}
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              {courier.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">
              {courier.fullName}
            </p>
            <p className="text-xs text-gray-500">Trae tu pedido</p>
          </div>

          <a
            href={`tel:${courier.indicative ?? ""}${courier.phone}`}
            className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            <IoCallOutline size={14} />
            Llamar
          </a>
        </div>
      ) : null}

      {isFinished ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <IoCheckmarkCircle size={18} />
          <span className="text-sm font-semibold">
            Entregado a las {formatTime(order.deliveredAt)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
