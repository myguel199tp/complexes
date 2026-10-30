"use client";

import React, { useState } from "react";
import { Badge, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMyPaymentsQuery } from "./use-my-payments-query";
import {
  downloadMyReceipt,
  downloadOnlinePaymentProof,
  MyPayment,
  MyPaymentItem,
} from "../services/myPaymentsService";

/** Los que se ven sin abrir la lista completa. */
const VISIBLE = 5;

const currency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const dateOf = (value: string) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Mis pagos: cada pago verificado con su recibo de caja, y el comprobante de
 * los pagos en línea.
 *
 * La lista de cuotas decía qué quedó pagado, pero no cuándo ni cómo, y no
 * había de dónde bajar el recibo: el residente que lo necesitaba para su
 * contador tenía que pedírselo a la administración.
 */
export default function MyPayments() {
  const conjuntoId = String(useConjuntoStore((state) => state.conjuntoId));
  const showAlert = useAlertStore((state) => state.showAlert);
  const { data, isLoading, error } = useMyPaymentsQuery();
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (key: string, run: () => Promise<void>) => {
    setDownloading(key);
    try {
      await run();
    } catch (e) {
      showAlert(
        e instanceof Error ? e.message : "No se pudo descargar el PDF",
        "error",
      );
    } finally {
      setDownloading(null);
    }
  };

  const payments = data?.payments ?? [];
  const visible = showAll ? payments : payments.slice(0, VISIBLE);

  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Text font="bold" size="lg">
            Mis pagos
          </Text>
          <Text size="xs" className="text-gray-500">
            Pagos verificados, con su recibo de caja.
          </Text>
        </div>

        {payments.length > 0 && (
          <div className="text-right">
            <Text size="xs" className="text-gray-500">
              Total pagado a cuotas
            </Text>
            <Text font="bold">{currency(data?.totalPaid ?? 0)}</Text>
          </div>
        )}
      </div>

      {isLoading && (
        <Text size="sm" className="text-gray-500">
          Cargando tus pagos…
        </Text>
      )}

      {error instanceof Error && (
        <Text size="sm" className="text-red-600">
          {error.message}
        </Text>
      )}

      {!isLoading && !error && payments.length === 0 && (
        <Text size="sm" className="text-gray-500">
          Todavía no tienes pagos verificados. Cuando pagues en línea o la
          administración apruebe un soporte, aparecerá aquí con su recibo.
        </Text>
      )}

      <div className="space-y-3">
        {visible.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            downloading={downloading}
            onProof={() =>
              download(`proof-${payment.id}`, () =>
                downloadOnlinePaymentProof(payment, conjuntoId),
              )
            }
            onReceipt={(item) =>
              download(item.installmentId, () =>
                downloadMyReceipt(item, conjuntoId),
              )
            }
          />
        ))}
      </div>

      {payments.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="self-start text-sm font-semibold text-blue-600 hover:underline"
        >
          {showAll ? "Ver menos" : `Ver todos (${payments.length})`}
        </button>
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  downloading,
  onProof,
  onReceipt,
}: {
  payment: MyPayment;
  downloading: string | null;
  onProof: () => void;
  onReceipt: (item: MyPaymentItem) => void;
}) {
  const online = payment.kind === "online";
  const title = online
    ? `Pago en línea${payment.items.length > 1 ? ` · ${payment.items.length} cuotas` : ""}`
    : payment.items[0]?.concept ?? "Pago";

  return (
    <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              colVariant={online ? "primary" : "success"}
              size="sm"
              font="bold"
            >
              {online ? "En línea" : "Soporte verificado"}
            </Badge>
            {payment.simulated && (
              <Badge colVariant="danger" size="sm" font="bold">
                Prueba
              </Badge>
            )}
          </div>
          <Text size="sm" font="semi">
            {title}
          </Text>
          <Text size="xs" className="text-gray-500">
            {dateOf(payment.paidAt)}
            {payment.reference ? ` · Ref. ${payment.reference}` : ""}
          </Text>
        </div>

        <div className="text-right">
          <Text font="bold">{currency(payment.total)}</Text>
          {payment.commission > 0 && (
            <Text size="xs" className="text-gray-500">
              {currency(payment.amount)} en cuotas +{" "}
              {currency(payment.commission + payment.taxAmount)} de comisión e
              IVA
            </Text>
          )}
        </div>
      </div>

      <ul className="divide-y rounded-md border bg-white">
        {payment.items.map((item) => (
          <li
            key={item.installmentId}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-sm text-gray-800">{item.concept}</span>
              <span className="text-xs text-gray-500">
                {item.receiptNumber
                  ? `Recibo ${item.receiptNumber}`
                  : "Recibo en trámite"}
                {` · ${item.unit}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">
                {currency(item.amount)}
              </span>
              {item.receiptNumber && (
                <button
                  type="button"
                  onClick={() => onReceipt(item)}
                  disabled={downloading === item.installmentId}
                  className="text-xs font-semibold text-blue-600 hover:underline disabled:text-gray-400"
                >
                  {downloading === item.installmentId
                    ? "Descargando…"
                    : "Recibo PDF"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {online && payment.canDownloadProof && (
        <button
          type="button"
          onClick={onProof}
          disabled={downloading === `proof-${payment.id}`}
          className="self-start text-sm font-semibold text-blue-600 hover:underline disabled:text-gray-400"
        >
          {downloading === `proof-${payment.id}`
            ? "Descargando…"
            : "📄 Descargar comprobante del pago"}
        </button>
      )}
    </div>
  );
}
