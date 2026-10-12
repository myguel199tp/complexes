"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { route } from "@/app/_domain/constants/routes";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { ExpenseApprovalServices } from "../services/expenseApprovalServices";
import { ApproverHistoryTerm } from "../services/response/expenseApprovalResponse";

const api = new ExpenseApprovalServices();

export const APPROVER_HISTORY_KEY = "expense_approver_history";

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

const day = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const unit = (term: ApproverHistoryTerm) =>
  [
    term.tower ? `Torre ${term.tower}` : null,
    term.apartment ? `Apto. ${term.apartment}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

const SOURCE: Record<string, string> = {
  council: "Presidente del consejo",
  designated: "Designado por la administración",
};

function TermRow({ term, open, onToggle }: {
  term: ApproverHistoryTerm;
  open: boolean;
  onToggle: () => void;
}) {
  const since = day(term.startedAt);
  const until = term.current ? "hoy" : day(term.endedAt);

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-left hover:bg-gray-50 rounded-lg px-2"
      >
        <span className="text-gray-400">
          {open ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-800">
            {term.name ?? "Propietario"}
            {term.current && (
              <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
                Aprueba hoy
              </span>
            )}
          </span>
          <span className="block text-xs text-gray-500">
            {[unit(term), term.source ? SOURCE[term.source] : null]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <span className="text-xs text-gray-500 tabular-nums">
          {since ? `${since} – ${until}` : "Periodo sin registrar"}
        </span>
        <span className="flex gap-2 text-xs font-semibold tabular-nums">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
            {term.approvedCount} confirmados
          </span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
            {term.rejectedCount} negados
          </span>
        </span>
      </button>

      {open && (
        <div className="pb-3 pl-8 pr-2">
          {term.reviews.length === 0 ? (
            <p className="text-xs text-gray-500">
              No respondió ningún gasto en este periodo.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-1 pr-3 font-medium">Respondió</th>
                    <th className="py-1 pr-3 font-medium">Gasto</th>
                    <th className="py-1 pr-3 font-medium text-right">Monto</th>
                    <th className="py-1 pr-3 font-medium">Respuesta</th>
                    <th className="py-1 font-medium">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {term.reviews.map((review) => (
                    <tr key={review.id} className="border-t border-gray-100 align-top">
                      <td className="py-1.5 pr-3 whitespace-nowrap text-gray-600">
                        {day(review.reviewedAt)}
                      </td>
                      <td className="py-1.5 pr-3 text-gray-800">
                        {review.concept}
                        {review.category && (
                          <span className="block text-gray-400">{review.category}</span>
                        )}
                        {review.deleted && (
                          <span className="block text-gray-500">Gasto eliminado después</span>
                        )}
                        {!review.deleted && review.changedSince && (
                          <span className="block text-amber-700">
                            Corregido después de esta respuesta
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-gray-800 whitespace-nowrap">
                        {money(review.amount)}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold ${
                            review.decision === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {review.decision === "approved" ? "Confirmó" : "Negó"}
                        </span>
                      </td>
                      <td className="py-1.5 text-gray-600 italic">
                        {review.comment ? `“${review.comment}”` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Historial de quién aprobó los gastos: cada periodo de cada presidente (o
 * designado) y lo que respondió. Lo ven la administración y el aprobador de
 * hoy, que así ve también lo de los anteriores.
 *
 * En Básico llegan solo los últimos días; el aviso dice cuánto quedó por fuera
 * y ofrece Oro. `audience` decide a quién se le habla: la administración
 * puede cambiar el plan, el presidente solo pedírselo.
 */
export default function ApproverHistory({
  audience,
}: {
  audience: "staff" | "approver";
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { data: result, isLoading, error } = useQuery({
    queryKey: [APPROVER_HISTORY_KEY, conjuntoId],
    queryFn: () => api.getHistory(),
    enabled: !!conjuntoId,
    retry: false,
  });
  const data = result?.terms ?? [];

  // El periodo actual abierto de entrada.
  const [openIds, setOpenIds] = useState<Set<string> | null>(null);
  const opened = openIds ?? new Set(data.filter((t) => t.current).map((t) => t.id));

  const toggle = (id: string) => {
    const next = new Set(opened);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  if (isLoading) {
    return <p className="text-xs text-gray-400">Cargando historial…</p>;
  }

  if (error) {
    return <p className="text-xs text-red-600">{(error as Error).message}</p>;
  }

  const limitNotice = result?.limitedToDays ? (
    <LimitNotice
      days={result.limitedToDays}
      hiddenReviews={result.hiddenReviews}
      hiddenTerms={result.hiddenTerms}
      audience={audience}
    />
  ) : null;

  if (data.length === 0) {
    return (
      <div className="space-y-2">
        {limitNotice}
        <p className="text-xs text-gray-500">
          {result?.limitedToDays
            ? `Nadie ha respondido gastos en los últimos ${result.limitedToDays} días.`
            : "Todavía nadie ha aprobado gastos en este conjunto."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {limitNotice}
      <ul className="divide-y-0">
        {data.map((term) => (
          <TermRow
            key={term.id}
            term={term}
            open={opened.has(term.id)}
            onToggle={() => toggle(term.id)}
          />
        ))}
      </ul>
    </div>
  );
}

/** Aviso del Básico: cuánto historial se ve y cómo ver el resto. */
function LimitNotice({
  days,
  hiddenReviews,
  hiddenTerms,
  audience,
}: {
  days: number;
  hiddenReviews: number;
  hiddenTerms: number;
  audience: "staff" | "approver";
}) {
  const hidden = [
    hiddenReviews
      ? `${hiddenReviews} ${hiddenReviews === 1 ? "respuesta anterior" : "respuestas anteriores"}`
      : null,
    hiddenTerms
      ? `${hiddenTerms} ${hiddenTerms === 1 ? "presidente anterior" : "presidentes anteriores"}`
      : null,
  ]
    .filter(Boolean)
    .join(" y ");

  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900 flex flex-wrap items-center justify-between gap-2">
      <p className="min-w-0 flex-1">
        Con el plan Básico ves los últimos {days} días.
        {hidden
          ? ` Hay ${hidden} guardados que se ven con el plan Oro.`
          : " Con el plan Oro ves el historial completo, desde el primer presidente."}
        {audience === "approver" &&
          " Pídele a la administración que suba el plan del conjunto."}
      </p>
      {audience === "staff" && (
        <Link
          href={route.payComplexes}
          className="shrink-0 rounded-full bg-cyan-700 px-3 py-1 font-semibold text-white hover:bg-cyan-800"
        >
          Ver planes
        </Link>
      )}
    </div>
  );
}
