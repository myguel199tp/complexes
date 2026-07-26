"use client";

import React, { useState } from "react";
import { Text, Title, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { Package2, CalendarClock, Loader2 } from "lucide-react";

import { route } from "@/app/_domain/constants/routes";
import MessageNotData from "@/app/components/messageNotData";
import {
  BookingResponse,
  BookingStatus,
  OrderResponse,
  OrderStatus,
} from "@/app/(panel)/my-advertisement/services/response/marketplaceResponse";
import {
  useBookingStatusMutation,
  useMySales,
  useOrderStatusMutation,
} from "./use-marketplace-queries";
import { StatusBadge } from "./status-badge";
import ReasonModal from "./reason-modal";
import { dateTime, money } from "./format";

type Tab = "orders" | "bookings";

type RejectTarget = { id: string; kind: "order" | "booking" };

/**
 * El lado del vendedor: aceptar, alistar, entregar; confirmar y prestar.
 *
 * Sin esta pantalla el pedido moría en `pending` para siempre, porque el único
 * endpoint que cambiaba el estado no lo llamaba nadie desde la interfaz.
 */
export default function Sales() {
  const router = useRouter();
  const { orders, bookings, isLoading } = useMySales();

  const [tab, setTab] = useState<Tab>("orders");
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const orderMutation = useOrderStatusMutation();
  const bookingMutation = useBookingStatusMutation();

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;

    if (rejectTarget.kind === "order") {
      orderMutation.mutate(
        {
          id: rejectTarget.id,
          status: OrderStatus.REJECTED,
          cancellationReason: reason,
        },
        { onSuccess: () => setRejectTarget(null) },
      );
    } else {
      bookingMutation.mutate(
        {
          id: rejectTarget.id,
          status: BookingStatus.REJECTED,
          cancellationReason: reason,
        },
        { onSuccess: () => setRejectTarget(null) },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
        <Loader2 className="animate-spin" size={20} />
        <Text>Cargando tus ventas...</Text>
      </div>
    );
  }

  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.PENDING,
  ).length;

  const pendingBookings = bookings.filter(
    (b) => b.status === BookingStatus.REQUESTED,
  ).length;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title className="text-2xl font-bold">Pedidos recibidos</Title>
          <Text size="sm" className="text-gray-500">
            {pendingOrders + pendingBookings > 0
              ? `Tienes ${pendingOrders + pendingBookings} solicitudes por responder`
              : "Todo al día"}
          </Text>
        </div>

        <Button colVariant="primary" onClick={() => router.push(route.myadd)}>
          Mis negocios
        </Button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <TabButton
          active={tab === "orders"}
          onClick={() => setTab("orders")}
          icon={<Package2 size={15} />}
          label={`Productos (${orders.length})`}
          badge={pendingOrders}
        />
        <TabButton
          active={tab === "bookings"}
          onClick={() => setTab("bookings")}
          icon={<CalendarClock size={15} />}
          label={`Agenda (${bookings.length})`}
          badge={pendingBookings}
        />
      </div>

      {(tab === "orders" ? orders : bookings).length === 0 ? (
        <div className="py-16">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tab === "orders"
            ? orders.map((order) => (
                <SaleOrderCard
                  key={order.id}
                  order={order}
                  isLoading={orderMutation.isPending}
                  onAdvance={(status) =>
                    orderMutation.mutate({ id: order.id, status })
                  }
                  onReject={() =>
                    setRejectTarget({ id: order.id, kind: "order" })
                  }
                />
              ))
            : bookings.map((booking) => (
                <SaleBookingCard
                  key={booking.id}
                  booking={booking}
                  isLoading={bookingMutation.isPending}
                  onAdvance={(status) =>
                    bookingMutation.mutate({ id: booking.id, status })
                  }
                  onReject={() =>
                    setRejectTarget({ id: booking.id, kind: "booking" })
                  }
                />
              ))}
        </div>
      )}

      <ReasonModal
        isOpen={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="Rechazar solicitud"
        hint="El comprador recibe tu motivo. Sé claro: es lo que sostiene la confianza entre vecinos."
        confirmLabel="Rechazar"
        isLoading={orderMutation.isPending || bookingMutation.isPending}
        onConfirm={handleReject}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? "border-cyan-600 text-cyan-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
      {!!badge && badge > 0 && (
        <span className="ml-1 rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function SaleOrderCard({
  order,
  isLoading,
  onAdvance,
  onReject,
}: {
  order: OrderResponse;
  isLoading: boolean;
  onAdvance: (status: OrderStatus) => void;
  onReject: () => void;
}) {
  /**
   * Los botones siguen la misma máquina de estados del backend: solo se
   * ofrece lo que la transición permite, en vez de dejar que el vendedor
   * intente algo que el servidor va a rechazar.
   */
  const nextAction: Record<string, { label: string; status: OrderStatus }[]> = {
    [OrderStatus.PENDING]: [
      { label: "Aceptar", status: OrderStatus.ACCEPTED },
    ],
    [OrderStatus.ACCEPTED]: [
      { label: "Marcar en preparación", status: OrderStatus.PREPARING },
      { label: "Marcar entregado", status: OrderStatus.COMPLETED },
    ],
    [OrderStatus.PREPARING]: [
      { label: "Marcar entregado", status: OrderStatus.COMPLETED },
    ],
  };

  const actions = nextAction[order.status] ?? [];
  const canReject = order.status === OrderStatus.PENDING;

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
            {order.unitId ? ` · Apto ${order.unitId}` : ""}
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

      {order.message && (
        <p className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-700">
          Comprador: “{order.message}”
        </p>
      )}

      {(order.contactPhone || order.contactEmail) && (
        <p className="text-xs text-gray-500">
          Contacto: {order.contactPhone ?? ""}{" "}
          {order.contactEmail ? `· ${order.contactEmail}` : ""}
        </p>
      )}

      {(actions.length > 0 || canReject) && (
        <footer className="flex flex-wrap gap-2 pt-1">
          {actions.map((action) => (
            <Button
              key={action.status}
              colVariant="success"
              size="sm"
              disabled={isLoading}
              onClick={() => onAdvance(action.status)}
            >
              {action.label}
            </Button>
          ))}

          {canReject && (
            <Button
              colVariant="danger"
              size="sm"
              disabled={isLoading}
              onClick={onReject}
            >
              Rechazar
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}

function SaleBookingCard({
  booking,
  isLoading,
  onAdvance,
  onReject,
}: {
  booking: BookingResponse;
  isLoading: boolean;
  onAdvance: (status: BookingStatus) => void;
  onReject: () => void;
}) {
  const nextAction: Record<string, { label: string; status: BookingStatus }[]> =
    {
      [BookingStatus.REQUESTED]: [
        { label: "Confirmar cita", status: BookingStatus.CONFIRMED },
      ],
      [BookingStatus.CONFIRMED]: [
        { label: "Marcar prestado", status: BookingStatus.COMPLETED },
        { label: "No asistió", status: BookingStatus.NO_SHOW },
      ],
    };

  const actions = nextAction[booking.status] ?? [];
  const canReject = booking.status === BookingStatus.REQUESTED;

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
            {booking.unitId ? ` · Apto ${booking.unitId}` : ""}
          </Text>
        </div>

        <StatusBadge status={booking.status} />
      </header>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-500">Valor</span>
        <span className="font-bold text-gray-900">{money(booking.price)}</span>
      </div>

      {booking.message && (
        <p className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-700">
          Cliente: “{booking.message}”
        </p>
      )}

      {(booking.contactPhone || booking.contactEmail) && (
        <p className="text-xs text-gray-500">
          Contacto: {booking.contactPhone ?? ""}{" "}
          {booking.contactEmail ? `· ${booking.contactEmail}` : ""}
        </p>
      )}

      {(actions.length > 0 || canReject) && (
        <footer className="flex flex-wrap gap-2 pt-1">
          {actions.map((action) => (
            <Button
              key={action.status}
              colVariant="success"
              size="sm"
              disabled={isLoading}
              onClick={() => onAdvance(action.status)}
            >
              {action.label}
            </Button>
          ))}

          {canReject && (
            <Button
              colVariant="danger"
              size="sm"
              disabled={isLoading}
              onClick={onReject}
            >
              Rechazar
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}
