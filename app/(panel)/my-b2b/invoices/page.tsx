"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  B2bInvoice,
  B2bInvoiceStatus,
  getMyB2bInvoices,
} from "../services/b2bAllianceService";

const STATUS_LABELS: Record<B2bInvoiceStatus, string> = {
  pending: "Por pagar",
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
  { value: "pending", label: "Por pagar" },
  { value: "paid", label: "Pagadas" },
];

const money = (amount: number, currency: string) =>
  `${new Intl.NumberFormat("es-CO").format(amount)} ${currency}`;

const date = (value: string) => new Date(value).toLocaleDateString("es-CO");

export default function MyB2bInvoicesPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [filter, setFilter] = useState<B2bInvoiceStatus | "all">("all");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["my_b2b_invoices", conjuntoId, filter],
    queryFn: () =>
      getMyB2bInvoices(conjuntoId, filter === "all" ? undefined : filter),
    enabled: !!conjuntoId,
  });

  /** Lo que el conjunto debe hoy, que es la cifra que importa al administrador. */
  const debt = useMemo(() => {
    const list = invoices ?? [];
    const unpaid = list.filter(
      (i) => i.status === "pending" || i.status === "overdue",
    );

    return {
      currency: list[0]?.currency ?? "COP",
      total: unpaid.reduce((acc, i) => acc + i.amount, 0),
      overdueCount: list.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between">
        <Title size="sm" font="bold" className="text-white">
          Facturas de tus aliados
        </Title>
        <Link
          href="/my-b2b/contracts"
          className="text-cyan-300 text-sm hover:text-cyan-200"
        >
          Mis contratos →
        </Link>
      </div>
      <p className="text-slate-400 text-sm mt-1">
        Lo que te cobran los proveedores B2B por cada periodo de servicio. El
        pago se hace directamente con el proveedor; aquí queda el registro.
      </p>

      {debt.total > 0 ? (
        <div
          className={`mt-4 rounded-2xl border p-4 ${
            debt.overdueCount > 0
              ? "border-red-500/20 bg-red-500/[0.06]"
              : "border-amber-500/20 bg-amber-500/[0.06]"
          }`}
        >
          <p
            className={`text-xs font-semibold ${
              debt.overdueCount > 0 ? "text-red-300" : "text-amber-300"
            }`}
          >
            {debt.overdueCount > 0
              ? `Tienes ${debt.overdueCount} factura(s) vencida(s)`
              : "Pendiente por pagar"}
          </p>
          <p className="text-slate-100 text-xl font-bold mt-1">
            {money(debt.total, debt.currency)}
          </p>
          {debt.overdueCount > 0 ? (
            <p className="text-slate-400 text-xs mt-1">
              El proveedor puede suspender el servicio mientras haya facturas
              vencidas.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 grid gap-3">
        {isLoading ? (
          <p className="text-slate-400 text-sm">Cargando...</p>
        ) : invoices && invoices.length > 0 ? (
          invoices.map((invoice: B2bInvoice) => (
            <div
              key={invoice.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-wrap justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-slate-100 font-semibold">
                  {invoice.invoiceNumber}
                  <span
                    className={`ml-2 text-xs ${STATUS_COLORS[invoice.status]}`}
                  >
                    {STATUS_LABELS[invoice.status]}
                  </span>
                </p>
                <p className="text-slate-400 text-xs">
                  {invoice.comercioName ?? "Proveedor"} · {invoice.planName}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Periodo {date(invoice.periodStart)} — {date(invoice.periodEnd)}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    invoice.status === "overdue"
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  {invoice.status === "paid" && invoice.paidAt
                    ? `Pagada el ${date(invoice.paidAt)}`
                    : `${invoice.status === "overdue" ? "Venció" : "Vence"} el ${date(invoice.dueDate)}`}
                </p>
              </div>
              <p className="text-slate-100 font-bold whitespace-nowrap">
                {money(invoice.amount, invoice.currency)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm">
            No hay facturas con este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
