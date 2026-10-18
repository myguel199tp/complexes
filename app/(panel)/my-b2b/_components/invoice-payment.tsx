"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bInvoice,
  reportB2bInvoicePayment,
} from "../services/b2bAllianceService";
import { fmtDate, ui } from "./b2b-ui";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * El conjunto registra que pagó una factura de un aliado. Eso crea el gasto en
 * «Mis cuentas» —con su confirmación del presidente— y le avisa al proveedor
 * para que confirme que recibió. Sin esto, la plata salía sin dejar rastro en
 * la contabilidad del conjunto.
 */
export function InvoicePayment({ invoice }: { invoice: B2bInvoice }) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [open, setOpen] = useState(false);
  const [paidAt, setPaidAt] = useState(today());
  const [reference, setReference] = useState("");

  const reportMut = useMutation({
    mutationFn: () =>
      reportB2bInvoicePayment(conjuntoId, invoice.id, {
        paidAt,
        paymentReference: reference.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert(
        "Pago registrado. Quedó como gasto en Mis cuentas y el proveedor debe confirmar que lo recibió.",
        "success",
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my_b2b_invoices"] });
      queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts"] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const unpaid = invoice.status === "pending" || invoice.status === "overdue";

  const expenseLink = invoice.expenseId ? (
    <Link href="/my-bills/expenses" className={`text-xs ${ui.link}`}>
      Ver gasto en Mis cuentas →
    </Link>
  ) : null;

  if (invoice.conjuntoReportedAt) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <HiOutlineCheckCircle size={15} />
          Pago registrado
          {invoice.conjuntoPaidAt ? ` el ${fmtDate(invoice.conjuntoPaidAt, true)}` : ""}
          {invoice.conjuntoPaymentReference
            ? ` · ref. ${invoice.conjuntoPaymentReference}`
            : ""}
        </span>
        {unpaid ? (
          <span className={`text-xs ${ui.muted}`}>Falta que el proveedor confirme.</span>
        ) : null}
        {expenseLink}
      </div>
    );
  }

  if (!unpaid) return expenseLink;

  return open ? (
    <div className={`${ui.subtle} p-3`}>
      <p className={`mb-2 text-xs ${ui.muted}`}>
        Quedará como gasto en Mis cuentas y el presidente lo confirmará.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className={ui.label} htmlFor={`paid-${invoice.id}`}>
            Fecha del pago
          </label>
          <input
            id={`paid-${invoice.id}`}
            type="date"
            max={today()}
            className={`${ui.input} !w-auto`}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </div>
        <div className="min-w-[10rem] flex-1">
          <label className={ui.label} htmlFor={`ref-${invoice.id}`}>
            Referencia <span className="font-normal">(opcional)</span>
          </label>
          <input
            id={`ref-${invoice.id}`}
            type="text"
            maxLength={120}
            placeholder="N.º de transferencia"
            className={ui.input}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            rounded="md"
            colVariant="success"
            disabled={!paidAt || reportMut.isLoading}
            onClick={() => reportMut.mutate()}
          >
            Registrar
          </Button>
          <Button size="sm" rounded="md" colVariant="default" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <Button size="xs" rounded="md" colVariant="primary" onClick={() => setOpen(true)}>
      Registrar pago
    </Button>
  );
}
