"use client";

import { useState } from "react";
import { Text } from "complexes-next-components";
import ApprovalCard from "./approval-card";
import ApproverHistory from "@/app/(panel)/my-bills/_components/approver-history";
import {
  useExpenseApprovalsQuery,
  useMyExpenseApproverStatus,
} from "./use-expense-approvals";

const TABS = [
  { key: "pending", label: "Por confirmar" },
  { key: "history", label: "Historial" },
] as const;

type Tab = (typeof TABS)[number]["key"];

/** Bandeja del presidente: gastos que la administración dice haber pagado. */
export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const { data: me, isLoading: loadingMe } = useMyExpenseApproverStatus();
  const { data = [], isLoading, error } = useExpenseApprovalsQuery("pending");

  if (!loadingMe && me && !me.isApprover) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center space-y-2 px-4">
        <Text size="md" font="bold" colVariant="on">
          No apruebas los gastos de este conjunto
        </Text>
        <p className="text-sm text-gray-500">
          Esta sección es para el presidente o el propietario que la
          administración designó para confirmar los pagos.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <Text size="lg" font="bold" colVariant="on">
          Gastos por confirmar
        </Text>
        <p className="text-sm text-gray-500">
          {me?.source === "council"
            ? "Como presidente del consejo, confirma o niega si aprobaste cada pago que registró la administración."
            : "La administración te designó para confirmar sus pagos. Confirma o niega si aprobaste cada uno."}
        </p>
      </header>

      <div className="flex gap-2 border-b border-gray-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "pending" && !!me?.pendingCount && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {me.pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "history" ? (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-2">
          <p className="text-xs text-gray-500">
            Lo que respondiste tú y lo que respondieron los presidentes
            anteriores, periodo por periodo.
          </p>
          <ApproverHistory audience="approver" />
        </section>
      ) : error ? (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      ) : isLoading ? (
        <p className="text-sm text-gray-400">Cargando gastos…</p>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          No tienes gastos por confirmar.
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((expense) => (
            <ApprovalCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
