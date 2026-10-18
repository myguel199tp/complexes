"use client";

import { useState } from "react";
import { Button } from "complexes-next-components";
import { FaWallet } from "react-icons/fa";
import {
  useAssignPettyCashMutation,
  usePettyCashQuery,
} from "./use-petty-cash";

const money = (value: number | string) => {
  const amount = Number(value);
  return isNaN(amount)
    ? String(value)
    : amount.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });
};

const day = (value: string) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Un movimiento de la caja menor: recarga del presidente o gasto. */
type Movement = {
  id: string;
  date: string;
  kind: "assignment" | "expense";
  label: string;
  detail: string | null;
  amount: number;
};

/**
 * Caja menor: saldo, recargas y gastos. Quien aprueba los gastos ve además el
 * formulario para recargarla; la administración la usa desde el formulario
 * de gastos («Pagado con la caja menor»).
 */
export default function PettyCashPanel({
  audience,
}: {
  audience: "staff" | "approver";
}) {
  const { data, isLoading, error } = usePettyCashQuery();
  const assign = useAssignPettyCashMutation();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Cargando caja menor…
      </p>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {(error as Error | null)?.message ?? "No se pudo cargar la caja menor"}
      </p>
    );
  }

  const movements: Movement[] = [
    ...data.assignments.map((a) => ({
      id: a.id,
      date: a.createdAt,
      kind: "assignment" as const,
      label: "Recarga",
      detail: [a.assignedByName, a.note].filter(Boolean).join(" · ") || null,
      amount: Number(a.amount),
    })),
    ...data.expenses.map((e) => ({
      id: e.id,
      date: e.paidAt ?? e.created_at,
      kind: "expense" as const,
      label: e.concept,
      detail:
        [e.category?.name, e.createdByName].filter(Boolean).join(" · ") ||
        null,
      amount: Number(e.amount),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visible = showAll ? movements : movements.slice(0, 6);
  const used =
    data.assigned > 0 ? Math.min(100, (data.spent / data.assigned) * 100) : 0;
  const low =
    data.lastAssignment !== null && data.balance <= data.lastAssignment * 0.2;

  const submit = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    assign.mutate(
      { amount: value, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setAmount("");
          setNote("");
        },
      },
    );
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4 dark:bg-gray-900 dark:border-gray-700">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaWallet className="text-cyan-700 dark:text-cyan-300" />
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Caja menor
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {audience === "approver"
                ? "Lo que asignes aquí, la administración lo puede gastar y reportar sin pedirte aprobación."
                : "Gastos pequeños que pagas y reportas sin pedir aprobación, mientras quepan en el saldo."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-xl font-bold tabular-nums ${
              low
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {money(data.balance)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">disponible</p>
        </div>
      </header>

      {data.assigned > 0 ? (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-full ${low ? "bg-amber-500" : "bg-cyan-600"}`}
              style={{ width: `${used}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Asignado {money(data.assigned)} · Gastado {money(data.spent)}
          </p>
        </div>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {audience === "approver"
            ? "Todavía no has asignado caja menor. Asigna un monto y la administración podrá pagar gastos pequeños sin pedirte aprobación uno por uno."
            : data.approver
              ? `Todavía no hay caja menor. La asigna ${data.approver.name ?? "quien aprueba los gastos"}${data.approver.source === "council" ? ", presidente del consejo" : ""}.`
              : "Todavía no hay caja menor. La asigna quien aprueba los gastos, y este conjunto aún no tiene a nadie para eso."}
        </p>
      )}

      {data.canAssign && (
        <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Recargar caja menor
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Monto, ej. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              maxLength={500}
              placeholder="Nota (opcional), ej. aprobado en acta de octubre"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <Button
              size="sm"
              colVariant="success"
              disabled={!Number(amount) || assign.isPending}
              onClick={submit}
            >
              {assign.isPending ? "Guardando…" : "Asignar"}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Se suma al saldo actual. Te avisamos cuando quede menos del 20 % de
            la última recarga.
          </p>
        </div>
      )}

      {movements.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Movimientos
          </p>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {visible.map((m) => (
              <li
                key={`${m.kind}-${m.id}`}
                className="flex items-start justify-between gap-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800 dark:text-gray-100">
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {day(m.date)}
                    {m.detail && ` · ${m.detail}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    m.kind === "assignment"
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {m.kind === "assignment" ? "+" : "−"}
                  {money(m.amount)}
                </span>
              </li>
            ))}
          </ul>
          {movements.length > visible.length && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-300"
            >
              Ver todos ({movements.length})
            </button>
          )}
        </div>
      )}
    </section>
  );
}
