"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Modal, TextAreaField, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import {
  MyOrder,
  cancelMyOrder,
  getMyOrders,
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

  const orders = ordersQuery.data ?? [];

  return (
    <div className="w-full">
      <Link href={route.myStore} className="text-cyan-700 text-sm">
        ← Volver a la tienda
      </Link>

      <Title size="sm" font="bold" className="mt-2">
        Mis pedidos
      </Title>

      {ordersQuery.isLoading ? (
        <p className="text-gray-500 mt-4">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 mt-4">Aún no has realizado pedidos.</p>
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
            {cancelMutation.isPending ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
