"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bInvoice,
  B2bInvoiceStatus,
  getB2bInvoices,
  payB2bInvoice,
} from "../services/b2bInvoicesService";

const STATUS_LABELS: Record<B2bInvoiceStatus, string> = {
  pending: "Por cobrar",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Anulada",
};

const STATUS_COLORS: Record<B2bInvoiceStatus, string> = {
  pending: "text-amber-400",
  paid: "text-emerald-400",
  overdue: "text-red-400",
  cancelled: "text-slate-500",
};

const FILTERS: { value: B2bInvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "pending", label: "Por cobrar" },
  { value: "paid", label: "Pagadas" },
  { value: "cancelled", label: "Anuladas" },
];

const money = (amount: number, currency: string) =>
  `${new Intl.NumberFormat("es-CO").format(amount)} ${currency}`;

const date = (value: string) => new Date(value).toLocaleDateString("es-CO");

export default function ComercioB2bInvoicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [filter, setFilter] = useState<B2bInvoiceStatus | "all">("all");
  // Factura sobre la que se está capturando la referencia del pago.
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reference, setReference] = useState("");

  useComercioGuard(() => router.push("/comercio/login"));

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["comercio_b2b_invoices", filter],
    queryFn: () =>
      getB2bInvoices(filter === "all" ? {} : { status: filter }),
  });

  const payMut = useMutation({
    mutationFn: (id: string) =>
      payB2bInvoice(id, { paymentReference: reference.trim() || undefined }),
    onSuccess: () => {
      showAlert("Pago registrado", "success");
      setPayingId(null);
      setReference("");
      queryClient.invalidateQueries({ queryKey: ["comercio_b2b_invoices"] });
      // El contrato pudo volver a estar activo si era el último vencido.
      queryClient.invalidateQueries({ queryKey: ["comercio_b2b_contracts"] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  /** Totales de lo que se está viendo, para no tener que sumar a ojo. */
  const totals = useMemo(() => {
    const list = invoices ?? [];
    const sum = (status: B2bInvoiceStatus) =>
      list
        .filter((i) => i.status === status)
        .reduce((acc, i) => acc + i.amount, 0);

    return {
      currency: list[0]?.currency ?? "COP",
      overdue: sum("overdue"),
      pending: sum("pending"),
      paid: sum("paid"),
    };
  }, [invoices]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Facturación
          </Title>
          <Link href="/comercio/b2b/contracts" className="text-cyan-400 text-sm">
            ← Contratos
          </Link>
        </div>

        <Text size="sm" className="text-slate-400 mt-1">
          Cada periodo de tus alianzas se factura automáticamente. Registra aquí
          los pagos que recibas de los conjuntos.
        </Text>

        {/* Totales de lo filtrado */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
            <Text size="xs" font="semi" className="text-red-300">Vencido</Text>
            <Text font="bold" className="text-slate-100 text-lg mt-1">
              {money(totals.overdue, totals.currency)}
            </Text>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <Text size="xs" font="semi" className="text-amber-300">Por cobrar</Text>
            <Text font="bold" className="text-slate-100 text-lg mt-1">
              {money(totals.pending, totals.currency)}
            </Text>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
            <Text size="xs" font="semi" className="text-emerald-300">Cobrado</Text>
            <Text font="bold" className="text-slate-100 text-lg mt-1">
              {money(totals.paid, totals.currency)}
            </Text>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                filter === f.value
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "text-slate-400 border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">Cargando...</Text>
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice: B2bInvoice) => (
              <div
                key={invoice.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <Text size="sm" font="semi" className="text-slate-100">
                      {invoice.invoiceNumber}
                      <span
                        className={`ml-2 text-xs ${STATUS_COLORS[invoice.status]}`}
                      >
                        {STATUS_LABELS[invoice.status]}
                      </span>
                    </Text>
                    <Text size="xs" className="text-slate-400">
                      {invoice.conjuntoName ?? invoice.conjuntoId} ·{" "}
                      {invoice.planName}
                    </Text>
                    <Text size="xs" className="text-slate-400 mt-1">
                      Periodo {date(invoice.periodStart)} —{" "}
                      {date(invoice.periodEnd)}
                    </Text>
                    <Text size="sm"
                      className={`text-xs mt-1 ${
                        invoice.status === "overdue"
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {invoice.status === "paid" && invoice.paidAt
                        ? `Pagada el ${date(invoice.paidAt)}`
                        : `${invoice.status === "overdue" ? "Venció" : "Vence"} el ${date(invoice.dueDate)}`}
                    </Text>
                    {invoice.paymentReference ? (
                      <Text size="xs" className="text-slate-500 mt-1">
                        Ref: {invoice.paymentReference}
                      </Text>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Text size="sm" font="bold" className="text-slate-100 whitespace-nowrap">
                      {money(invoice.amount, invoice.currency)}
                    </Text>
                    {invoice.status === "pending" ||
                    invoice.status === "overdue" ? (
                      <Button
                        colVariant="success"
                        size="xs"
                        rounded="md"
                        onClick={() => {
                          setPayingId(
                            payingId === invoice.id ? null : invoice.id,
                          );
                          setReference("");
                        }}
                      >
                        {payingId === invoice.id ? "Cancelar" : "Registrar pago"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {payingId === invoice.id ? (
                  <div className="mt-3 border-t border-white/10 pt-3 flex flex-wrap items-center gap-2">
                    <input
                      className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                      placeholder="Referencia del pago (opcional)"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                    <Button
                      colVariant="success"
                      size="sm"
                      rounded="md"
                      onClick={() => payMut.mutate(invoice.id)}
                      disabled={payMut.isLoading}
                    >
                      {payMut.isLoading ? "Guardando..." : "Confirmar pago"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <Text size="sm" className="text-slate-400">
              No hay facturas con este filtro.
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
