"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Modal,
  SelectField,
  Table,
  TextAreaField,
  Title,
} from "complexes-next-components";
import Link from "next/link";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioOrder,
  ComercioOrderStatus,
  assignDelivery,
  cancelOrder,
  confirmOrder,
  getOrders,
} from "./services/comercioOrderService";
import { getDeliveries } from "../deliveries/services/comercioDeliveryService";

const statusTabs: { label: string; value: ComercioOrderStatus | "" }[] = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmados", value: "confirmed" },
  { label: "Asignados", value: "assigned" },
  { label: "En camino", value: "in_transit" },
  { label: "Entregados", value: "delivered" },
  { label: "Cancelados", value: "cancelled" },
];

const statusBadge: Record<
  ComercioOrderStatus,
  { label: string; colVariant: "success" | "warning" | "danger" | "primary" | "default" }
> = {
  pending: { label: "Pendiente", colVariant: "warning" },
  confirmed: { label: "Confirmado", colVariant: "primary" },
  assigned: { label: "Asignado", colVariant: "primary" },
  in_transit: { label: "En camino", colVariant: "primary" },
  delivered: { label: "Entregado", colVariant: "success" },
  cancelled: { label: "Cancelado", colVariant: "danger" },
};

export default function ComercioOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [statusFilter, setStatusFilter] = useState<ComercioOrderStatus | "">("");
  const [assignModalOrder, setAssignModalOrder] = useState<ComercioOrder | null>(
    null,
  );
  const [cancelModalOrder, setCancelModalOrder] = useState<ComercioOrder | null>(
    null,
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const ordersQuery = useQuery({
    queryKey: ["comercio-orders", statusFilter],
    queryFn: () => getOrders(statusFilter || undefined),
  });

  const deliveriesQuery = useQuery({
    queryKey: ["comercio-deliveries"],
    queryFn: getDeliveries,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmOrder(id),
    onSuccess: () => {
      showAlert("Pedido confirmado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignDelivery(assignModalOrder!.id, selectedDeliveryId),
    onSuccess: () => {
      showAlert("Repartidor asignado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
      setAssignModalOrder(null);
      setSelectedDeliveryId("");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(cancelModalOrder!.id, cancelReason),
    onSuccess: () => {
      showAlert("Pedido cancelado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
      setCancelModalOrder(null);
      setCancelReason("");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const orders = ordersQuery.data ?? [];
  const activeDeliveries = (deliveriesQuery.data ?? []).filter(
    (delivery) => delivery.isActive,
  );

  const headers = [
    "Fecha",
    "Items",
    "Total",
    "Repartidor",
    "Estado",
    "",
  ];

  const rows = orders.map((order) => {
    const badge = statusBadge[order.status];
    const itemsSummary = order.items
      .map((item) => `${item.quantity}x ${item.nameSnapshot}`)
      .join(", ");

    const actions: React.ReactNode[] = [];

    if (order.status === "pending") {
      actions.push(
        <Button
          key="confirm"
          size="xs"
          rounded="md"
          colVariant="success"
          onClick={() => confirmMutation.mutate(order.id)}
        >
          Confirmar
        </Button>,
      );
    }

    if (order.status === "confirmed") {
      actions.push(
        <Button
          key="assign"
          size="xs"
          rounded="md"
          onClick={() => setAssignModalOrder(order)}
        >
          Asignar repartidor
        </Button>,
      );
    }

    if (!["delivered", "cancelled"].includes(order.status)) {
      actions.push(
        <Button
          key="cancel"
          size="xs"
          rounded="md"
          colVariant="danger"
          onClick={() => setCancelModalOrder(order)}
        >
          Cancelar
        </Button>,
      );
    }

    return [
      new Date(order.createdAt).toLocaleString(),
      <span key={`items-${order.id}`} className="text-xs">
        {itemsSummary}
      </span>,
      Number(order.discountAmount) > 0 ? (
        <div key={`total-${order.id}`} className="text-xs">
          <span className="line-through text-slate-500">
            ${Number(order.subtotalAmount).toLocaleString()}
          </span>
          <div className="font-semibold text-emerald-400">
            ${Number(order.totalAmount).toLocaleString()}
          </div>
          <span className="text-slate-500">
            -${Number(order.discountAmount).toLocaleString()} desc.
          </span>
        </div>
      ) : (
        `$${Number(order.totalAmount).toLocaleString()}`
      ),
      order.delivery?.fullName ?? "-",
      <Badge key={order.id} colVariant={badge.colVariant} size="xs">
        {badge.label}
      </Badge>,
      <div key={`actions-${order.id}`} className="flex gap-2 flex-wrap">
        {actions}
      </div>,
    ];
  });

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver al panel
          </Link>
          <Title as="h1" size="lg" colVariant="on" font="semi" className="mt-2">
            Pedidos
          </Title>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value || "all"}
              size="sm"
              rounded="md"
              colVariant={statusFilter === tab.value ? "primary" : "default"}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {ordersQuery.isLoading ? (
            <p className="text-slate-400 p-4">Cargando pedidos...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-400 p-4">No hay pedidos en este estado.</p>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>
      </div>

      <Modal
        isOpen={!!assignModalOrder}
        onClose={() => {
          setAssignModalOrder(null);
          setSelectedDeliveryId("");
        }}
        title="Asignar repartidor"
      >
        <div className="space-y-4 p-2">
          <SelectField
            options={activeDeliveries.map((delivery) => ({
              label: delivery.fullName,
              value: delivery.id,
            }))}
            defaultOption="Selecciona un repartidor"
            value={selectedDeliveryId}
            onChange={(e) => setSelectedDeliveryId(e.target.value)}
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
          {activeDeliveries.length === 0 && (
            <p className="text-sm text-amber-400">
              No tienes repartidores activos. Regístralos en la sección de
              Repartidores.
            </p>
          )}
          <Button
            colVariant="success"
            size="full"
            rounded="md"
            disabled={!selectedDeliveryId || assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            {assignMutation.isPending ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!cancelModalOrder}
        onClose={() => {
          setCancelModalOrder(null);
          setCancelReason("");
        }}
        title="Cancelar pedido"
      >
        <div className="space-y-4 p-2">
          <TextAreaField
            placeholder="Motivo de la cancelación"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />
          <Button
            colVariant="danger"
            size="full"
            rounded="md"
            disabled={!cancelReason.trim() || cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
