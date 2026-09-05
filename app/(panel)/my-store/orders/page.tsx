"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Modal,
  TextAreaField,
  Title,
  Text,
} from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import {
  MyOrder,
  PAYMENT_METHOD_LABELS,
  PAYMENT_REFERENCE_MIN,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  cancelMyOrder,
  getMyOrders,
  reportMyPayment,
} from "../services/comercioStoreService";

const statusBadge: Record<
  MyOrder["status"],
  { label: string; colVariant: "success" | "warning" | "danger" | "primary" }
> = {
  pending: { label: "Pendiente", colVariant: "warning" },
  confirmed: { label: "Confirmado", colVariant: "primary" },
  assigned: { label: "Asignado", colVariant: "primary" },
  in_transit: { label: "En camino", colVariant: "primary" },
  delivered: { label: "Entregado", colVariant: "success" },
  cancelled: { label: "Cancelado", colVariant: "danger" },
};

export default function MyStoreOrdersPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [cancelOrder, setCancelOrder] = useState<MyOrder | null>(null);
  const [reason, setReason] = useState("");

  const [payOrder, setPayOrder] = useState<MyOrder | null>(null);
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["store-my-orders", conjuntoId],
    queryFn: () => getMyOrders(conjuntoId),
    enabled: !!conjuntoId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelMyOrder(conjuntoId, cancelOrder!.id, reason),
    onSuccess: () => {
      showAlert("Pedido cancelado", "success");
      queryClient.invalidateQueries({ queryKey: ["store-my-orders"] });
      setCancelOrder(null);
      setReason("");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const payMutation = useMutation({
    mutationFn: () =>
      reportMyPayment(conjuntoId, payOrder!.id, {
        reference,
        receipt: receipt ?? undefined,
      }),
    onSuccess: () => {
      showAlert(
        "Pago reportado. El comercio lo verifica y te avisamos.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["store-my-orders"] });
      setPayOrder(null);
      setReference("");
      setReceipt(null);
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const orders = ordersQuery.data ?? [];

  return (
    <div className="w-full">
      <Link href={route.myStore} className="text-cyan-700 text-sm">
        ← Volver a la tienda
      </Link>

      <Title size="sm" font="bold" className="mt-2" colVariant="on">
        Mis pedidos
      </Title>

      {ordersQuery.isLoading ? (
        <Text size="sm" className="text-gray-500 mt-4">
          Cargando pedidos...
        </Text>
      ) : orders.length === 0 ? (
        <Text size="sm" className="text-gray-500 mt-4">
          Aún no has realizado pedidos.
        </Text>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => {
            const badge = statusBadge[order.status];
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <div className="text-sm mt-1">
                      {order.items
                        .map((item) => `${item.quantity}x ${item.nameSnapshot}`)
                        .join(", ")}
                    </div>
                  </div>
                  <Badge colVariant={badge.colVariant} size="xs">
                    {badge.label}
                  </Badge>
                </div>

                <div className="flex justify-between items-center mt-3">
                  {Number(order.discountAmount) > 0 ? (
                    <div className="text-sm">
                      <span className="line-through text-gray-400">
                        ${Number(order.subtotalAmount).toLocaleString()}
                      </span>{" "}
                      <span className="font-bold text-emerald-600">
                        ${Number(order.totalAmount).toLocaleString()}
                      </span>
                      <div className="text-xs text-emerald-600">
                        Ahorraste $
                        {Number(order.discountAmount).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <span className="font-bold">
                      ${Number(order.totalAmount).toLocaleString()}
                    </span>
                  )}
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant="danger"
                      onClick={() => setCancelOrder(order)}
                    >
                      Cancelar pedido
                    </Button>
                  )}
                </div>

                {/* El estado del pago va aparte del estado del pedido: un
                    pedido entregado puede seguir sin pagar, y mezclarlos en un
                    solo indicador esconde justo el caso que importa. */}
                <div className="mt-3 border-t pt-2">
                  <span className="text-xs text-gray-500">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{" "}
                  </span>
                  <span
                    className={`text-xs font-semibold ${PAYMENT_STATUS_TONE[order.paymentStatus]}`}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>

                  {order.paymentRejectionReason ? (
                    <p className="text-xs text-red-500 mt-1">
                      {order.paymentRejectionReason}
                    </p>
                  ) : null}

                  {/* Sólo la transferencia se reporta: lo de contraentrega lo
                      registra el repartidor al cobrar en la puerta. */}
                  {order.paymentMethod === "transferencia" &&
                  order.paymentStatus !== "paid" &&
                  order.status !== "cancelled" ? (
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant="primary"
                      className="mt-2"
                      onClick={() => setPayOrder(order)}
                    >
                      {order.paymentStatus === "rejected"
                        ? "Volver a reportar el pago"
                        : "Ya pagué"}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!cancelOrder}
        onClose={() => {
          setCancelOrder(null);
          setReason("");
        }}
        title="Cancelar pedido"
      >
        <div className="space-y-4 p-2">
          <TextAreaField
            placeholder="Motivo de la cancelación"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
          />
          <Button
            colVariant="danger"
            size="full"
            rounded="md"
            disabled={!reason.trim() || cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending
              ? "Cancelando..."
              : "Confirmar cancelación"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!payOrder}
        onClose={() => {
          setPayOrder(null);
          setReference("");
          setReceipt(null);
        }}
        title="Reportar el pago"
      >
        <div className="space-y-4 p-2">
          <Text size="sm" className="text-gray-600">
            Escribe el número de la transferencia y adjunta el comprobante si lo
            tienes. El comercio lo busca en su cuenta y lo confirma; el pago no
            queda registrado hasta ese momento.
          </Text>

          <div>
            <label className="text-xs text-gray-500">
              Número de la transferencia
            </label>
            <input
              className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
              placeholder="Ej: TRF-99321"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">
              Comprobante (opcional)
            </label>
            <input
              className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button
            colVariant="success"
            size="full"
            rounded="md"
            disabled={
              reference.trim().length < PAYMENT_REFERENCE_MIN ||
              payMutation.isPending
            }
            onClick={() => payMutation.mutate()}
          >
            {payMutation.isPending ? "Enviando..." : "Reportar el pago"}
          </Button>

          {reference.trim().length > 0 &&
          reference.trim().length < PAYMENT_REFERENCE_MIN ? (
            <Text size="xs" colVariant="danger">
              La referencia debe tener al menos {PAYMENT_REFERENCE_MIN}{" "}
              caracteres: es con lo que el comercio busca el movimiento.
            </Text>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
