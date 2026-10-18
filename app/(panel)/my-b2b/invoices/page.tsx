"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineReceiptPercent } from "react-icons/hi2";
import { InvoicePayment } from "../_components/invoice-payment";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  B2bInvoice,
  B2bInvoiceStatus,
  getMyB2bInvoices,
} from "../services/b2bAllianceService";
import {
  Callout,
  EmptyState,
  LoadingCards,
  PageHeader,
  Pill,
  Stat,
  Tone,
  fmtDate,
  fmtMoney,
  ui,
} from "../_components/b2b-ui";

const STATUS_LABELS: Record<B2bInvoiceStatus, string> = {
  pending: "Por pagar",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Anulada",
};

const STATUS_TONE: Record<B2bInvoiceStatus, Tone> = {
  pending: "warning",
  paid: "success",
  overdue: "danger",
  cancelled: "neutral",
};

type Filter = B2bInvoiceStatus | "all" | "unpaid";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "unpaid", label: "Por pagar" },
  { value: "overdue", label: "Vencidas" },
  { value: "paid", label: "Pagadas" },
  { value: "all", label: "Todas" },
];

const matches = (invoice: B2bInvoice, filter: Filter) =>
  filter === "all"
    ? true
    : filter === "unpaid"
      ? invoice.status === "pending" || invoice.status === "overdue"
      : invoice.status === filter;

function InvoiceRow({ invoice }: { invoice: B2bInvoice }) {
  const overdue = invoice.status === "overdue";

  return (
    <article
      className={`${ui.card} p-4 ${overdue ? "!border-red-500/40" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold ${ui.strong}`}>
              {invoice.comercioName ?? "Proveedor"}
            </h3>
            <Pill tone={STATUS_TONE[invoice.status]}>{STATUS_LABELS[invoice.status]}</Pill>
          </div>
          <p className={`text-xs ${ui.muted}`}>
            {invoice.planName} · {invoice.invoiceNumber}
          </p>
          <p className={`mt-1 text-xs ${ui.faint}`}>
            Periodo del {fmtDate(invoice.periodStart, true)} al{" "}
            {fmtDate(invoice.periodEnd, true)}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-lg font-bold ${ui.strong}`}>
            {fmtMoney(invoice.amount, invoice.currency)}
          </p>
          <p
            className={`text-xs ${
              overdue ? "font-semibold text-red-700 dark:text-red-300" : ui.muted
            }`}
          >
            {invoice.status === "paid" && invoice.paidAt
              ? `Pagada el ${fmtDate(invoice.paidAt, true)}`
              : invoice.status === "cancelled"
                ? "Anulada"
                : `${overdue ? "Venció" : "Vence"} el ${fmtDate(invoice.dueDate, true)}`}
          </p>
        </div>
      </div>

      <div className={`mt-3 border-t pt-3 ${ui.divider}`}>
        <InvoicePayment invoice={invoice} />
      </div>
    </article>
  );
}

export default function MyB2bInvoicesPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [filter, setFilter] = useState<Filter>("unpaid");

  // Se traen todas y se filtra aquí: el resumen de lo que se debe no puede
  // depender de la pestaña que se esté mirando.
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["my_b2b_invoices", conjuntoId, "all"],
    queryFn: () => getMyB2bInvoices(conjuntoId),
    enabled: !!conjuntoId,
  });

  const all = useMemo(() => invoices ?? [], [invoices]);

  const summary = useMemo(() => {
    const unpaid = all.filter((i) => matches(i, "unpaid"));
    const overdue = all.filter((i) => i.status === "overdue");
    return {
      currency: all[0]?.currency ?? "COP",
      total: unpaid.reduce((acc, i) => acc + i.amount, 0),
      unpaidCount: unpaid.length,
      overdueTotal: overdue.reduce((acc, i) => acc + i.amount, 0),
      overdueCount: overdue.length,
      toReport: unpaid.filter((i) => !i.conjuntoReportedAt).length,
    };
  }, [all]);

  const list = all.filter((i) => matches(i, filter));

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        title="Facturas"
        description="Lo que te cobran tus aliados por cada periodo. El pago se hace directo con el proveedor; al registrarlo aquí queda como gasto del conjunto."
      />

      {isLoading ? (
        <LoadingCards />
      ) : all.length === 0 ? (
        <EmptyState icon={<HiOutlineReceiptPercent />} title="Aún no hay facturas">
          Cuando un proveedor confirme una alianza, cada periodo de servicio
          llega aquí como factura.
        </EmptyState>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              label="Pendiente por pagar"
              value={fmtMoney(summary.total, summary.currency)}
              hint={`${summary.unpaidCount} factura${summary.unpaidCount === 1 ? "" : "s"}`}
            />
            <Stat
              label="Vencido"
              value={fmtMoney(summary.overdueTotal, summary.currency)}
              tone={summary.overdueCount > 0 ? "danger" : "neutral"}
              hint={
                summary.overdueCount > 0
                  ? `${summary.overdueCount} factura${summary.overdueCount === 1 ? "" : "s"}`
                  : "Al día"
              }
            />
            <Stat
              label="Pagos sin registrar"
              value={summary.toReport}
              tone={summary.toReport > 0 ? "warning" : "neutral"}
              hint="Regístralos para que entren a Mis cuentas"
            />
          </div>

          {summary.overdueCount > 0 ? (
            <div className="mt-4">
              <Callout tone="danger" title="Tienes facturas vencidas">
                El proveedor puede suspender el servicio mientras haya facturas
                vencidas. Si ya pagaste, regístralo para que lo confirme.
              </Callout>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count = all.filter((i) => matches(i, f.value)).length;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    filter === f.value
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-75">{count}</span>
                </button>
              );
            })}
          </div>

          {list.length ? (
            <div className="mt-4 grid gap-3">
              {list.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <p className={`mt-6 text-sm ${ui.muted}`}>
              {filter === "unpaid"
                ? "Estás al día: no hay facturas por pagar."
                : "No hay facturas en esta pestaña."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
