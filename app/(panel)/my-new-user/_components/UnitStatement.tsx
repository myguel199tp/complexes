"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { downloadReceipt, getUnitStatement } from "../services/statementService";
import { feeStatusLabel } from "@/app/(panel)/my-vip/services/response/adminfeesResponse";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

/**
 * Tramos de antigüedad. Sin esto, una cuota vencida ayer y una de hace dos
 * años pesaban exactamente igual en la vista de la administración.
 */
const AGING_LABELS: { key: keyof AgingShape; label: string; tone: string }[] = [
  { key: "current", label: "Al día / -30", tone: "text-gray-700" },
  { key: "days30", label: "31-60 días", tone: "text-yellow-700" },
  { key: "days60", label: "61-90 días", tone: "text-orange-600" },
  { key: "days90", label: "91-120 días", tone: "text-red-600" },
  { key: "days90plus", label: "+120 días", tone: "text-red-800" },
];

type AgingShape = {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
};

/** Estado de cuenta de una unidad: saldo, antigüedad, detalle e historial. */
export default function UnitStatement({ relationId }: { relationId: string }) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["unit-statement", relationId, conjuntoId],
    queryFn: () => getUnitStatement(relationId, conjuntoId),
    enabled: !!relationId && !!conjuntoId,
  });

  if (isLoading) {
    return (
      <Text size="sm" className="text-gray-500">
        Cargando estado de cuenta...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-red-500">
        No se pudo cargar el estado de cuenta: {String(error)}
      </Text>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* RESUMEN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-white p-3">
          <Text size="xs" className="text-gray-500">
            Saldo pendiente
          </Text>
          <Text
            font="bold"
            className={
              data.balance.outstanding > 0 ? "text-red-600" : "text-green-600"
            }
          >
            {money(data.balance.outstanding)}
          </Text>
        </div>

        <div className="rounded-lg border bg-white p-3">
          <Text size="xs" className="text-gray-500">
            Vencido
          </Text>
          <Text font="bold">{money(data.balance.overdue)}</Text>
        </div>

        {/*
          Consignado y esperando verificación: ni deuda del residente ni recaudo
          del conjunto. Antes iba mezclado con lo pendiente.
        */}
        <div className="rounded-lg border bg-white p-3">
          <Text size="xs" className="text-gray-500">
            Por verificar
          </Text>
          <Text font="bold" className="text-blue-600">
            {money(data.balance.inReview)}
          </Text>
        </div>

        <div className="rounded-lg border bg-white p-3">
          <Text size="xs" className="text-gray-500">
            Intereses de mora
          </Text>
          <Text font="bold">{money(data.balance.mora)}</Text>
        </div>
      </div>

      {/* ESTADO */}
      <div className="flex items-center gap-3">
        <Badge
          size="sm"
          colVariant={data.isUpToDate ? "success" : "danger"}
          rounded="lg"
        >
          {data.isUpToDate ? "A paz y salvo" : "Con saldo pendiente"}
        </Badge>

        {!data.isUpToDate && data.daysOverdue > 0 && (
          <Text size="xs" className="text-gray-500">
            Deuda más antigua: {data.daysOverdue} días
          </Text>
        )}
      </div>

      {/* ANTIGÜEDAD */}
      {!data.isUpToDate && (
        <div>
          <Text size="xs" font="bold" className="text-gray-400 uppercase mb-2">
            Antigüedad de la deuda
          </Text>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {AGING_LABELS.map(({ key, label, tone }) => (
              <div key={key} className="rounded-lg border bg-white p-2">
                <Text size="xs" className="text-gray-500">
                  {label}
                </Text>
                <Text size="sm" font="semi" className={tone}>
                  {money(data.aging[key])}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POR CONCEPTO */}
      {data.byType.length > 0 && (
        <div>
          <Text size="xs" font="bold" className="text-gray-400 uppercase mb-2">
            Por concepto
          </Text>

          <div className="flex flex-col gap-2">
            {data.byType.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-lg border bg-white p-3"
              >
                <div>
                  <Text size="sm" font="semi">
                    {item.type}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {item.count} cuota{item.count > 1 ? "s" : ""}
                  </Text>
                </div>

                <Text size="sm" font="bold">
                  {money(item.total)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*
        PAGOS Y RECIBOS

        El historial por cuota no mostraba con qué pagos se cubrió ni con qué
        recibo, y hasta ahora no se emitía ninguno: el residente no tenía de
        dónde bajar un comprobante de lo que ya pagó.
      */}
      {data.payments?.length > 0 && (
        <div>
          <Text size="xs" font="bold" className="text-gray-400 uppercase mb-2">
            Pagos verificados
          </Text>

          <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2 pr-1">
            {data.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3"
              >
                <div>
                  <Text size="sm" font="semi">
                    {payment.concept ?? "Pago"}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {new Date(payment.paidAt).toLocaleDateString("es-CO")}
                    {payment.receiptNumber ? ` · ${payment.receiptNumber}` : ""}
                  </Text>
                </div>

                <div className="flex items-center gap-3">
                  <Text size="sm" font="bold">
                    {money(payment.amount)}
                  </Text>

                  {payment.receiptNumber && (
                    <button
                      onClick={() =>
                        downloadReceipt(payment.id, conjuntoId).catch(() => {})
                      }
                      className="rounded border border-cyan-600 px-2 py-1 text-xs text-cyan-700 hover:bg-cyan-50"
                    >
                      Recibo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETALLE */}
      {data.fees.length > 0 && (
        <div>
          <Text size="xs" font="bold" className="text-gray-400 uppercase mb-2">
            Cuotas pendientes
          </Text>

          <div className="max-h-[260px] overflow-y-auto flex flex-col gap-2 pr-1">
            {data.fees.map((fee) => (
              <div
                key={fee.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3"
              >
                <div>
                  <Text size="sm" font="semi">
                    {fee.customName || fee.type}
                  </Text>

                  <Text size="xs" className="text-gray-500">
                    Vence {new Date(fee.dueDate).toLocaleDateString("es-CO")}
                    {fee.daysOverdue > 0
                      ? ` · ${fee.daysOverdue} días vencida`
                      : ""}
                  </Text>

                  {fee.rejectionReason && (
                    <Text size="xs" className="text-red-600">
                      Rechazado: {fee.rejectionReason}
                    </Text>
                  )}
                </div>

                <div className="text-right">
                  <Text size="sm" font="bold">
                    {money(fee.amount)}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {feeStatusLabel(fee.status)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
