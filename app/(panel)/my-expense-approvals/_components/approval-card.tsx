"use client";

import { useState } from "react";
import { Button, Text } from "complexes-next-components";
import { FaFilePdf } from "react-icons/fa";
import { ApprovalExpense } from "@/app/(panel)/my-bills/services/response/expenseApprovalResponse";
import {
  useOpenExpenseFile,
  useReviewExpenseMutation,
} from "./use-expense-approvals";

const money = (amount: string) => {
  const value = Number(amount);
  return isNaN(value)
    ? amount
    : value.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });
};

const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const period = (value: string) => {
  const parsed = new Date(value);
  return isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
};

const STATUS = {
  approved: { label: "Aprobado", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rechazado", className: "bg-red-100 text-red-700" },
} as const;

/**
 * Un gasto que la administración quiere pagar, para aprobar o rechazar antes
 * del pago. La respuesta es definitiva, así que pasa por un segundo paso
 * antes de enviarse; rechazar exige contar por qué.
 */
export default function ApprovalCard({ expense }: { expense: ApprovalExpense }) {
  const [mode, setMode] = useState<"approved" | "rejected" | null>(null);
  const [comment, setComment] = useState("");
  const review = useReviewExpenseMutation();
  const openFile = useOpenExpenseFile();

  const pending = expense.approvalStatus === "pending";
  const needsReason = mode === "rejected" && !comment.trim();

  const send = () => {
    if (!mode || needsReason) return;
    review.mutate({
      id: expense.id,
      decision: mode,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Text size="md" font="bold" colVariant="on">
            {expense.concept}
          </Text>
          <p className="text-xs text-gray-500">
            {expense.category?.name ?? "Sin categoría"} · Periodo{" "}
            {period(expense.period)}
          </p>
        </div>
        <p className="text-lg font-bold text-gray-900 tabular-nums">
          {money(expense.amount)}
        </p>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
        <div>
          <dt className="text-gray-400">Pago</dt>
          <dd className="text-gray-700">
            {expense.paidAt
              ? `Pagado el ${date(expense.paymentDate ?? expense.paidAt)}`
              : pending
                ? "Espera tu aprobación"
                : expense.approvalStatus === "rejected"
                  ? "No se paga"
                  : "Aún sin pagar"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-400">Registrado por</dt>
          <dd className="text-gray-700">{expense.createdByName ?? "Administración"}</dd>
        </div>
        <div>
          <dt className="text-gray-400">Registrado el</dt>
          <dd className="text-gray-700">{date(expense.created_at)}</dd>
        </div>
      </dl>

      {expense.observations && (
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {expense.observations}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {expense.hasFile && (
          <button
            type="button"
            onClick={() => openFile(expense.id)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:underline"
          >
            <FaFilePdf /> Ver cotización o factura
          </button>
        )}

        {expense.hasReceipt && (
          <button
            type="button"
            onClick={() => openFile(expense.id, "receipt")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:underline"
          >
            <FaFilePdf /> Ver comprobante de pago
          </button>
        )}

        {expense.approvalStatus && expense.approvalStatus !== "pending" && (
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[expense.approvalStatus].className}`}
          >
            {STATUS[expense.approvalStatus].label}
            {expense.reviewedAt && ` · ${date(expense.reviewedAt)}`}
          </span>
        )}
      </div>

      {!pending && expense.reviewComment && (
        <p className="text-xs italic text-gray-600">“{expense.reviewComment}”</p>
      )}

      {pending && !mode && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" colVariant="success" onClick={() => setMode("approved")}>
            Aprobar
          </Button>
          <Button size="sm" colVariant="danger" onClick={() => setMode("rejected")}>
            Rechazar
          </Button>
        </div>
      )}

      {pending && mode && (
        <div
          className={`rounded-xl border p-3 space-y-2 ${
            mode === "approved"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-sm font-semibold text-gray-800">
            {mode === "approved"
              ? `¿Apruebas que la administración pague ${money(expense.amount)}?`
              : "¿Por qué rechazas este gasto?"}
          </p>
          <label htmlFor={`comment-${expense.id}`} className="sr-only">
            Comentario
          </label>
          <textarea
            id={`comment-${expense.id}`}
            rows={2}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              mode === "approved"
                ? "Nota para la administración (opcional)"
                : "Ej.: el valor es muy alto, pide otra cotización…"
            }
            className="ui-native w-full"
          />
          <p className="text-xs text-gray-500">
            Tu respuesta es definitiva. Si la administración corrige el gasto,
            te llegará de nuevo.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              colVariant="warning"
              onClick={() => {
                setMode(null);
                setComment("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              colVariant={mode === "approved" ? "success" : "danger"}
              disabled={needsReason || review.isPending}
              onClick={send}
            >
              {review.isPending
                ? "Enviando…"
                : mode === "approved"
                  ? "Aprobar gasto"
                  : "Rechazar gasto"}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
