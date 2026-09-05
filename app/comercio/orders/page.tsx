"use client";

import { useState } from "react";
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
  Text,
} from "complexes-next-components";
import Link from "next/link";
import { useComercioGuard } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioOrder,
  ComercioOrderStatus,
  PAYMENT_METHOD_LABELS,
  PAYMENT_REJECTION_REASON_MIN,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  assignDelivery,
  cancelOrder,
  confirmOrder,
  confirmPayment,
  getOrders,
  paymentReceiptUrl,
  rejectPayment,
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
  const [paymentModalOrder, setPaymentModalOrder] =
    useState<ComercioOrder | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState("");
  useComercioGuard(() => router.push("/comercio/login"));

  const ordersQuery = useQuery({
    queryKey: ["comercio-orders", statusFilter],
    queryFn: () => getOrders(statusFilter || undefined),
  });

  const deliveriesQuery = useQuery({
    queryKey: ["comercio-deliveries"],
    queryFn: () => getDeliveries(),
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

  const closePaymentModal = () => {
    setPaymentModalOrder(null);
    setPaymentRejectReason("");
  };

  const confirmPaymentMutation = useMutation({
    mutationFn: () => confirmPayment(paymentModalOrder!.id),
    onSuccess: () => {
      showAlert("Pago confirmado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
      closePaymentModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: () =>
      rejectPayment(paymentModalOrder!.id, paymentRejectReason.trim()),
    onSuccess: () => {
      showAlert("Pago rechazado. Le avisamos al cliente.", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
      closePaymentModal();
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
    "Cobro",
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

    // Verificar el pago sólo tiene sentido sobre lo que el cliente reportó: en
    // contraentrega lo registra el repartidor al cobrar en la puerta.
    if (order.paymentStatus === "reported") {
      actions.push(
        <Button
          key="pay"
          size="xs"
          rounded="md"
          colVariant="primary"
          onClick={() => setPaymentModalOrder(order)}
        >
          Verificar pago
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
      // El cobro va en su propia columna: un pedido entregado puede seguir sin
      // pagar, y meterlo en el estado del pedido escondería justo ese caso.
      <div key={`pay-${order.id}`} className="flex flex-col text-xs">
        <span className={PAYMENT_STATUS_TONE[order.paymentStatus]}>
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </span>
        <span className="text-slate-500">
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </span>
      </div>,
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
            <Text size="sm" className="text-slate-400 p-4">Cargando pedidos...</Text>
          ) : orders.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">No hay pedidos en este estado.</Text>
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
            <Text size="sm" colVariant="warning">
              No tienes repartidores activos. Regístralos en la sección de
              Repartidores.
            </Text>
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

      <Modal
        isOpen={!!paymentModalOrder}
        onClose={closePaymentModal}
        title="Verificar el pago"
      >
        {paymentModalOrder && (
          <div className="space-y-4 p-2">
            <div className="text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Total:</span> $
                {Number(paymentModalOrder.totalAmount).toLocaleString("es-CO")}
              </p>
              <p>
                <span className="text-slate-500">Referencia:</span>{" "}
                {paymentModalOrder.paymentReference ?? "—"}
              </p>
              {paymentModalOrder.paymentReportedAt ? (
                <p>
                  <span className="text-slate-500">Reportado:</span>{" "}
                  {new Date(
                    paymentModalOrder.paymentReportedAt,
                  ).toLocaleString("es-CO")}
                </p>
              ) : null}
            </div>

            {/* Buscar el movimiento en la cuenta es el trabajo; el comprobante
                es lo que lo hace posible, así que va antes de los botones. */}
            {paymentModalOrder.paymentReceiptPath ? (
              <a
                href={paymentReceiptUrl(paymentModalOrder.id)}
                className="inline-block rounded-md border border-white/10 px-3 py-2 text-sm text-cyan-300"
              >
                Descargar comprobante
              </a>
            ) : (
              <Text size="xs" className="text-slate-500">
                El cliente no adjuntó comprobante: verifica por la referencia.
              </Text>
            )}

            <Button
              colVariant="success"
              size="full"
              rounded="md"
              disabled={confirmPaymentMutation.isPending}
              onClick={() => confirmPaymentMutation.mutate()}
            >
              {confirmPaymentMutation.isPending
                ? "Confirmando..."
                : "Lo encontré en mi cuenta"}
            </Button>

            <TextAreaField
              placeholder="¿Por qué no lo das por bueno? (mínimo 10 caracteres)"
              value={paymentRejectReason}
              onChange={(e) => setPaymentRejectReason(e.target.value)}
              className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
            />

            <Button
              colVariant="danger"
              size="full"
              rounded="md"
              disabled={
                paymentRejectReason.trim().length <
                  PAYMENT_REJECTION_REASON_MIN ||
                rejectPaymentMutation.isPending
              }
              onClick={() => rejectPaymentMutation.mutate()}
            >
              {rejectPaymentMutation.isPending
                ? "Rechazando..."
                : "No encuentro el pago"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
