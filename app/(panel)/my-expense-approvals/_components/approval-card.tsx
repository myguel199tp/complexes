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
  approved: { label: "Confirmado", className: "bg-green-100 text-green-800" },
  rejected: { label: "Negado", className: "bg-red-100 text-red-700" },
} as const;

/**
 * Un gasto para confirmar o negar. La respuesta es definitiva, así que pasa
 * por un segundo paso antes de enviarse; negar exige contar por qué.
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
          <dt className="text-gray-400">Fecha de pago</dt>
          <dd className="text-gray-700">{date(expense.paymentDate)}</dd>
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
            <FaFilePdf /> Ver factura
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
            Sí, lo aprobé
          </Button>
          <Button size="sm" colVariant="danger" onClick={() => setMode("rejected")}>
            No lo aprobé
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
              ? `¿Confirmas que aprobaste este pago de ${money(expense.amount)}?`
              : "¿Por qué niegas este gasto?"}
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
                : "Ej.: no autoricé este pago, el valor acordado era otro…"
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  ? "Confirmar"
                  : "Negar gasto"}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
