"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyQuotes } from "../services/b2bQuoteService";
import { getMyApprovals } from "../services/b2bApprovalService";
import {
  getMyB2bContracts,
  getMyB2bInvoices,
} from "../services/b2bAllianceService";

/**
 * El recorrido de una contratación, en el orden en que pasa: se busca el
 * aliado, se cotiza, el conjunto decide, el proveedor confirma y se paga.
 *
 * Antes eran seis pestañas sueltas y no se entendía que una lleva a la otra;
 * numeradas, con lo que espera acción contado en cada paso y una línea que
 * dice qué se hace aquí, el administrador sabe dónde está y qué sigue.
 */
const FLOW = [
  {
    href: "/my-b2b",
    label: "Aliados",
    hint: "Busca proveedores verificados y compara sus planes.",
  },
  {
    href: "/my-b2b/quotes",
    label: "Cotizaciones",
    hint: "Pide precios a la medida y marca las que quieres comparar.",
  },
  {
    href: "/my-b2b/approvals",
    label: "Decisiones",
    hint: "El consejo (Platino) o el presidente (Básico y Oro) elige la propuesta.",
  },
  {
    href: "/my-b2b/contracts",
    label: "Contratos",
    hint: "El proveedor confirma la alianza. Aquí ves la vigencia y las renovaciones.",
  },
  {
    href: "/my-b2b/invoices",
    label: "Facturas",
    hint: "Registra cada pago: queda como gasto del conjunto en Mis cuentas.",
  },
] as const;

const GROUP_BUY = {
  href: "/my-b2b/demands",
  label: "Compra en grupo",
  hint: "Súmate con otros conjuntos de tu ciudad para negociar un mejor precio.",
};

const SHARED = { staleTime: 60_000, retry: false } as const;

/** Lo que espera acción del administrador en cada paso. */
function usePendingCounts(conjuntoId: string): Record<string, number> {
  const enabled = !!conjuntoId;

  const quotes = useQuery({
    queryKey: ["my_b2b_quotes", conjuntoId],
    queryFn: () => getMyQuotes(conjuntoId),
    enabled,
    ...SHARED,
  });
  const approvals = useQuery({
    queryKey: ["my_b2b_approvals", conjuntoId],
    queryFn: () => getMyApprovals(conjuntoId),
    enabled,
    ...SHARED,
  });
  const contracts = useQuery({
    queryKey: ["my_b2b_contracts", conjuntoId],
    queryFn: () => getMyB2bContracts(conjuntoId),
    enabled,
    ...SHARED,
  });
  const invoices = useQuery({
    queryKey: ["my_b2b_invoices", conjuntoId, "all"],
    queryFn: () => getMyB2bInvoices(conjuntoId),
    enabled,
    ...SHARED,
  });

  return {
    // Con precio y sin decisión: esperan que se lleven al consejo o al presidente.
    "/my-b2b/quotes": (quotes.data ?? []).filter(
      (q) => q.status === "quoted" && !q.decision,
    ).length,
    "/my-b2b/approvals": (approvals.data ?? []).filter(
      (a) => a.status === "pending",
    ).length,
    // Renovaciones por llevar a decisión y contratos sin fecha de fin.
    "/my-b2b/contracts": (contracts.data ?? []).filter(
      (c) => (c.renewalOffer && !c.renewalOffer.inDecision) || c.needsEndDate,
    ).length,
    // Lo que se debe y aún no se registró como pagado.
    "/my-b2b/invoices": (invoices.data ?? []).filter(
      (i) =>
        (i.status === "pending" || i.status === "overdue") &&
        !i.conjuntoReportedAt,
    ).length,
  };
}

export function B2bNav() {
  const pathname = usePathname();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const counts = usePendingCounts(conjuntoId);

  const inGroupBuy = pathname.startsWith(GROUP_BUY.href);

  // "/my-b2b" es prefijo de todas; la ficha de un aliado (/my-b2b/<id>) cuenta
  // como el paso de aliados.
  const laterIndex = FLOW.findIndex(
    (s) => s.href !== "/my-b2b" && pathname.startsWith(s.href),
  );
  const activeIndex = inGroupBuy ? -1 : laterIndex >= 0 ? laterIndex : 0;
  const hint = inGroupBuy ? GROUP_BUY.hint : FLOW[activeIndex]?.hint;

  return (
    <nav aria-label="Pasos de una contratación" className="mt-4">
      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        <ol className="flex shrink-0 items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          {FLOW.map((step, i) => {
            const active = i === activeIndex;
            const done = activeIndex > i;
            const count = counts[step.href] ?? 0;

            return (
              <li key={step.href} className="flex items-center">
                <Link
                  href={step.href}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-600 text-white shadow-sm dark:bg-cyan-500/90"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      active
                        ? "bg-white/25 text-white"
                        : done
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                          : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step.label}
                  {count > 0 ? (
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-bold ${
                        active ? "bg-white text-cyan-700" : "bg-amber-500 text-white"
                      }`}
                      title="Esperan acción tuya"
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
                {i < FLOW.length - 1 ? (
                  <span
                    aria-hidden
                    className="mx-0.5 hidden h-px w-3 bg-slate-300 sm:block dark:bg-white/15"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <Link
          href={GROUP_BUY.href}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3 py-2 text-sm font-medium transition ${
            inGroupBuy
              ? "border-cyan-500 bg-cyan-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <HiOutlineUserGroup size={16} />
          {GROUP_BUY.label}
        </Link>
      </div>

      {hint ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {activeIndex >= 0 ? (
            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
              Paso {activeIndex + 1} de {FLOW.length} ·{" "}
            </span>
          ) : null}
          {hint}
        </p>
      ) : null}
    </nav>
  );
}
