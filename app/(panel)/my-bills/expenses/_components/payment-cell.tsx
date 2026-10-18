"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import { FaFilePdf } from "react-icons/fa";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useOpenExpenseFile } from "@/app/(panel)/my-expense-approvals/_components/use-expense-approvals";
import { DataExpenseServices } from "../../services/dataExpenseServices";
import { ExpenseResponse } from "../../services/response/expenseResponse";

const api = new DataExpenseServices();

const MAX_RECEIPT_BYTES = 5_000_000;

const day = (value: string) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const today = () => new Date().toLocaleDateString("en-CA");

function usePayExpenseMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      api.payExpense(conjuntoId, id, form),
    onSuccess: () => {
      showAlert("Gasto marcado como pagado.", "success");
      queryClient.invalidateQueries({
        queryKey: ["query_info_expense", conjuntoId],
      });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });
}

/**
 * El pago del gasto: pagado (fecha, quién y comprobante), o el botón para
 * marcarlo como pagado si ya se puede. Lo pendiente y lo rechazado no se pagan.
 */
export default function PaymentCell({ expense }: { expense: ExpenseResponse }) {
  const [open, setOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(today());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pay = usePayExpenseMutation();
  const openFile = useOpenExpenseFile();

  if (expense.paidAt) {
    return (
      <div className="flex flex-col gap-1 text-xs">
        <span className="w-fit rounded-full bg-cyan-100 px-2 py-0.5 font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">
          Pagado
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {day(expense.paymentDate ?? expense.paidAt)}
          {expense.paidByName && ` · ${expense.paidByName}`}
        </span>
        {expense.hasReceipt && (
          <button
            type="button"
            onClick={() => openFile(expense.id, "receipt")}
            className="inline-flex w-fit items-center gap-1 font-medium text-cyan-700 hover:underline dark:text-cyan-300"
          >
            <FaFilePdf /> Comprobante
          </button>
        )}
      </div>
    );
  }

  if (expense.approvalStatus === "pending") {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Espera aprobación para pagarse
      </span>
    );
  }

  if (expense.approvalStatus === "rejected") {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        No se paga
      </span>
    );
  }

  if (!open) {
    return (
      <Button size="sm" colVariant="success" onClick={() => setOpen(true)}>
        Marcar como pagado
      </Button>
    );
  }

  const submit = () => {
    if (!paymentDate) return setError("Indica la fecha del pago");
    if (receipt && receipt.size > MAX_RECEIPT_BYTES) {
      return setError("El comprobante no puede pesar más de 5 MB");
    }
    setError(null);

    const form = new FormData();
    // Mediodía local: la fecha no se corre de día al pasar a UTC.
    form.append("paymentDate", new Date(`${paymentDate}T12:00:00`).toISOString());
    if (receipt) form.append("file", receipt);

    pay.mutate(
      { id: expense.id, form },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-700 dark:bg-gray-800">
      <label className="flex flex-col gap-1 font-medium text-gray-700 dark:text-gray-300">
        Fecha del pago
        <input
          type="date"
          value={paymentDate}
          max={today()}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </label>
      <label className="flex flex-col gap-1 font-medium text-gray-700 dark:text-gray-300">
        Comprobante (PDF, opcional)
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
          className="text-gray-600 file:mr-2 file:rounded file:border-0 file:bg-cyan-50 file:px-2 file:py-1 file:text-cyan-700 dark:text-gray-300 dark:file:bg-cyan-950 dark:file:text-cyan-300"
        />
      </label>
      {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
      <div className="flex gap-2">
        <Button
          size="sm"
          colVariant="warning"
          disabled={pay.isPending}
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          colVariant="success"
          disabled={pay.isPending}
          onClick={submit}
        >
          {pay.isPending ? "Guardando…" : "Confirmar pago"}
        </Button>
      </div>
    </div>
  );
}
