"use client";

import React, { useState } from "react";
import { Text, Title, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { Package2, CalendarClock, Loader2 } from "lucide-react";
import { FiStar } from "react-icons/fi";

import { route } from "@/app/_domain/constants/routes";
import MessageNotData from "@/app/components/messageNotData";
import {
  BookingResponse,
  BookingStatus,
  CLOSED_BOOKING_STATUSES,
  CLOSED_ORDER_STATUSES,
  OrderResponse,
  OrderStatus,
} from "@/app/(panel)/my-advertisement/services/response/marketplaceResponse";
import {
  useBookingStatusMutation,
  useMyPurchases,
  useOrderStatusMutation,
} from "./use-marketplace-queries";
import { StatusBadge } from "./status-badge";
import RatingModal from "./rating-modal";
import ReasonModal from "./reason-modal";
import { dateTime, money } from "./format";

type Tab = "orders" | "bookings";

type RatingTarget = {
  id: string;
  kind: "order" | "booking";
  sellerLabel: string;
};

type CancelTarget = { id: string; kind: "order" | "booking" };

/**
 * Lo que el comprador ve después de pedir.
 *
 * Es la mitad del flujo que no existía: se podía (en teoría) crear un pedido,
 * pero no había ninguna pantalla donde ver en qué quedó, ni forma de cancelarlo
 * ni de calificar al vecino que atendió.
 */
export default function Purchases() {
  const router = useRouter();
  const { orders, bookings, isLoading } = useMyPurchases();

  const [tab, setTab] = useState<Tab>("orders");
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);

  const orderMutation = useOrderStatusMutation();
  const bookingMutation = useBookingStatusMutation();

  const handleCancel = (reason: string) => {
    if (!cancelTarget) return;

    if (cancelTarget.kind === "order") {
      orderMutation.mutate(
        {
          id: cancelTarget.id,
          status: OrderStatus.CANCELLED,
          cancellationReason: reason,
        },
        { onSuccess: () => setCancelTarget(null) },
      );
    } else {
      bookingMutation.mutate(
        {
          id: cancelTarget.id,
          status: BookingStatus.CANCELLED,
          cancellationReason: reason,
        },
        { onSuccess: () => setCancelTarget(null) },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
        <Loader2 className="animate-spin" size={20} />
        <Text>Cargando tus pedidos...</Text>
      </div>
    );
  }

  const list = tab === "orders" ? orders : bookings;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title className="text-2xl font-bold">Mis pedidos</Title>
          <Text size="sm" className="text-gray-500">
            Lo que le compraste o agendaste a tus vecinos
          </Text>
        </div>

        <Button
          colVariant="primary"
          onClick={() => router.push(route.myAdvertisement)}
        >
          Ir al marketplace
        </Button>
      </div>

      {/* Productos y servicios se separan porque no se siguen igual: uno se
          entrega, el otro tiene fecha y hora. */}
      <div className="flex gap-2 border-b border-gray-200">
        <TabButton
          active={tab === "orders"}
          onClick={() => setTab("orders")}
          icon={<Package2 size={15} />}
          label={`Productos (${orders.length})`}
        />
        <TabButton
          active={tab === "bookings"}
          onClick={() => setTab("bookings")}
          icon={<CalendarClock size={15} />}
          label={`Citas (${bookings.length})`}
        />
      </div>

      {list.length === 0 ? (
        <div className="py-16">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tab === "orders"
            ? orders.map((order) => (
                <PurchaseOrderCard
                  key={order.id}
                  order={order}
                  onCancel={() =>
                    setCancelTarget({ id: order.id, kind: "order" })
                  }
                  onRate={() =>
                    setRatingTarget({
                      id: order.id,
                      kind: "order",
                      sellerLabel: `Pedido #${order.codigo ?? ""}`,
                    })
                  }
                />
              ))
            : bookings.map((booking) => (
                <PurchaseBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() =>
                    setCancelTarget({ id: booking.id, kind: "booking" })
                  }
                  onRate={() =>
                    setRatingTarget({
                      id: booking.id,
                      kind: "booking",
                      sellerLabel: booking.serviceName ?? "Servicio",
                    })
                  }
                />
              ))}
        </div>
      )}

      <RatingModal
        isOpen={ratingTarget !== null}
        target={ratingTarget}
        onClose={() => setRatingTarget(null)}
      />

      <ReasonModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancelar"
        hint="Cuéntale al vendedor por qué cancelas. Le llega la notificación con tu motivo."
        confirmLabel="Cancelar pedido"
        isLoading={orderMutation.isPending || bookingMutation.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? "border-cyan-600 text-cyan-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PurchaseOrderCard({
  order,
  onCancel,
  onRate,
}: {
  order: OrderResponse;
  onCancel: () => void;
  onRate: () => void;
}) {
  // El comprador solo puede cancelar mientras el pedido no haya salido.
  const canCancel = !CLOSED_ORDER_STATUSES.includes(order.status);
  const canRate = order.status === OrderStatus.COMPLETED;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Text size="xs" className="font-mono text-gray-400">
            #{order.codigo}
          </Text>
          <Text font="bold" className="text-gray-900">
            {money(order.total)}
          </Text>
          <Text size="xs" className="text-gray-400">
            {dateTime(order.createdAt)}
          </Text>
        </div>

        <StatusBadge status={order.status} />
      </header>

      <ul className="space-y-1 border-t border-gray-100 pt-3">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <span className="truncate">
              {item.quantity} × {item.name ?? "Producto"}
            </span>
            <span className="shrink-0 font-medium">{money(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {order.sellerMessage && (
        <Text size="xs" className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-blue-800">
          Vendedor: “{order.sellerMessage}”
        </Text>
      )}

      {order.cancellationReason && (
        <Text size="xs" colVariant="danger" className="rounded-xl bg-red-50 border border-red-100 px-3 py-2">
          Motivo: {order.cancellationReason}
        </Text>
      )}

      {(canCancel || canRate) && (
        <footer className="flex gap-2 pt-1">
          {canRate && (
            <Button colVariant="success" size="sm" onClick={onRate}>
              <span className="flex items-center gap-1.5">
                <FiStar size={13} />
                Calificar
              </span>
            </Button>
          )}

          {canCancel && (
            <Button colVariant="danger" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}

function PurchaseBookingCard({
  booking,
  onCancel,
  onRate,
}: {
  booking: BookingResponse;
  onCancel: () => void;
  onRate: () => void;
}) {
  const canCancel = !CLOSED_BOOKING_STATUSES.includes(booking.status);
  const canRate = booking.status === BookingStatus.COMPLETED;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <Text size="xs" className="font-mono text-gray-400">
            #{booking.codigo}
          </Text>
          <Text font="bold" className="text-gray-900">
            {booking.serviceName ?? "Servicio"}
          </Text>
          <Text size="xs" className="text-cyan-700 font-semibold">
            {dateTime(booking.startAt)} · {booking.durationMinutes} min
          </Text>
        </div>

        <StatusBadge status={booking.status} />
      </header>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-500">Valor acordado</span>
        <span className="font-bold text-gray-900">{money(booking.price)}</span>
      </div>

      {booking.sellerMessage && (
        <Text size="xs" className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-blue-800">
          Vendedor: “{booking.sellerMessage}”
        </Text>
      )}

      {booking.cancellationReason && (
        <Text size="xs" colVariant="danger" className="rounded-xl bg-red-50 border border-red-100 px-3 py-2">
          Motivo: {booking.cancellationReason}
        </Text>
      )}

      {(canCancel || canRate) && (
        <footer className="flex gap-2 pt-1">
          {canRate && (
            <Button colVariant="success" size="sm" onClick={onRate}>
              <span className="flex items-center gap-1.5">
                <FiStar size={13} />
                Calificar
              </span>
            </Button>
          )}

          {canCancel && (
            <Button colVariant="danger" size="sm" onClick={onCancel}>
              Cancelar cita
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}
