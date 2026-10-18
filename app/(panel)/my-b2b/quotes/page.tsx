"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import {
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { B2B_SERVICE_CATEGORY_LABELS } from "@/app/helpers/b2bServiceCategories";
import {
  B2bQuote,
  B2bQuoteStatus,
  QUOTE_CLOSING_REASON_MIN,
  QUOTE_STATUS_LABELS,
  cancelQuote,
  getMyQuotes,
  rejectQuote,
} from "../services/b2bQuoteService";
import { ApprovalFormModal } from "../_components/approval-form-modal";
import { GroupProgress } from "../_components/group-progress";
import {
  EmptyState,
  Fact,
  LoadingCards,
  PageHeader,
  PERIOD_SHORT,
  Pill,
  SectionTitle,
  Tone,
  fmtDate,
  fmtMoney,
  ui,
} from "../_components/b2b-ui";
import {
  APPROVAL_CHANNEL_LABELS,
  APPROVAL_MAX_PROPOSALS,
} from "../services/b2bApprovalService";
import { B2bContract, getMyB2bContracts } from "../services/b2bAllianceService";

const STATUS_TONE: Record<B2bQuoteStatus, Tone> = {
  requested: "neutral",
  visit_scheduled: "info",
  quoted: "success",
  accepted: "success",
  rejected: "neutral",
  declined: "warning",
  expired: "warning",
  cancelled: "neutral",
};

const STEPS = ["Solicitada", "Visita", "Con precio", "Decisión"];

/** Hasta dónde avanzó la cotización, para la barra de pasos. */
function stageOf(q: B2bQuote): number {
  if (q.status === "accepted" || q.decision) return 3;
  if (q.status === "quoted") return 2;
  if (q.status === "visit_scheduled") return 1;
  return 0;
}

function QuoteProgress({ quote }: { quote: B2bQuote }) {
  const stage = stageOf(quote);
  return (
    <ol className="mt-3 flex items-center gap-1" aria-label="Avance de la cotización">
      {STEPS.map((label, i) => (
        <li key={label} className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`h-1.5 rounded-full ${
              i <= stage ? "bg-cyan-500" : "bg-slate-200 dark:bg-white/10"
            }`}
          />
          <span
            className={`truncate text-[10px] ${
              i === stage ? "font-semibold text-cyan-700 dark:text-cyan-300" : ui.faint
            }`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function priceLine(q: B2bQuote) {
  if (q.amount == null) return null;
  const money = fmtMoney(q.amount, q.currency);
  return q.kind === "recurrente" && q.billingPeriod
    ? `${money} / ${PERIOD_SHORT[q.billingPeriod] ?? q.billingPeriod}`
    : `${money} · pago único`;
}

export default function MyB2bQuotesPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  // Qué cotización se está cerrando y con qué motivo. Se guarda el id y no un
  // booleano para que dos tarjetas no compartan el mismo cuadro de texto.
  const [closing, setClosing] = useState<{
    id: string;
    action: "reject" | "cancel";
    reason: string;
  } | null>(null);

  // Lo marcado para compararlo en una misma decisión: lo normal es llevarle al
  // consejo las tres que se pidieron para el mismo servicio. Las renovaciones
  // de proveedores actuales compiten en el mismo cuadro.
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([]);
  const [deciding, setDeciding] = useState(false);

  const totalSelected = selected.length + selectedRenewals.length;
  const full = totalSelected >= APPROVAL_MAX_PROPOSALS;

  const toggleIn =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
      setter((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : full ? prev : [...prev, id],
      );
  const toggle = toggleIn(setSelected);
  const toggleRenewal = toggleIn(setSelectedRenewals);
  const clearSelection = () => {
    setSelected([]);
    setSelectedRenewals([]);
  };

  const { data: contracts } = useQuery({
    queryKey: ["my_b2b_contracts", conjuntoId],
    queryFn: () => getMyB2bContracts(conjuntoId),
    enabled: !!conjuntoId,
  });

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["my_b2b_quotes", conjuntoId],
    queryFn: () => getMyQuotes(conjuntoId),
    enabled: !!conjuntoId,
  });

  const closeMut = useMutation({
    mutationFn: (p: { id: string; action: "reject" | "cancel"; reason: string }) =>
      p.action === "reject"
        ? rejectQuote(conjuntoId, p.id, p.reason)
        : cancelQuote(conjuntoId, p.id, p.reason),
    onSuccess: () => {
      showAlert("Cotización cerrada", "success");
      setClosing(null);
      queryClient.invalidateQueries({ queryKey: ["my_b2b_quotes", conjuntoId] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const all = quotes ?? [];
  const ready = all.filter((q) => q.status === "quoted" && !q.decision);
  const waiting = all.filter(
    (q) => q.status === "requested" || q.status === "visit_scheduled",
  );
  const inDecision = all.filter((q) => q.status === "quoted" && q.decision);
  const history = all.filter(
    (q) => !["quoted", "requested", "visit_scheduled"].includes(q.status),
  );

  const renewalOffers = (contracts ?? []).filter(
    (c) => c.renewalOffer && !c.renewalOffer.inDecision,
  );
  const selectedOffers = renewalOffers.filter((c) =>
    selectedRenewals.includes(c.renewalOffer!.id),
  );
  const selectedQuotes = all.filter((q) => selected.includes(q.id));

  const shortReason =
    !!closing && closing.reason.trim().length < QUOTE_CLOSING_REASON_MIN;

  const renderQuote = (q: B2bQuote) => {
    const selectable = q.status === "quoted" && !q.decision;
    const isSelected = selected.includes(q.id);
    const isClosing = closing?.id === q.id;
    const price = priceLine(q);

    return (
      <article
        key={q.id}
        className={`${ui.card} p-4 transition ${
          isSelected ? "!border-cyan-500 ring-2 ring-cyan-500/20" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          {selectable ? (
            <input
              type="checkbox"
              aria-label="Marcar para comparar en una decisión"
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-cyan-600 disabled:cursor-not-allowed"
              checked={isSelected}
              disabled={!isSelected && full}
              onChange={() => toggle(q.id)}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                  {q.categoryOther ?? B2B_SERVICE_CATEGORY_LABELS[q.category] ?? q.category}
                </p>
                <h3 className={`font-semibold ${ui.strong}`}>{q.title}</h3>
                <p className={`text-xs ${ui.muted}`}>
                  {q.comercioName ?? "Proveedor"} · {q.quoteNumber}
                </p>
              </div>
              <Pill tone={q.decision ? "accent" : STATUS_TONE[q.status]}>
                {q.decision ? "En decisión" : QUOTE_STATUS_LABELS[q.status]}
              </Pill>
            </div>

            {["requested", "visit_scheduled", "quoted", "accepted"].includes(q.status) ? (
              <QuoteProgress quote={q} />
            ) : null}

            {price || q.validUntil || q.visitScheduledAt ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {price ? (
                  <Fact label={q.group ? "Precio techo" : "Precio"}>{price}</Fact>
                ) : null}
                {q.status === "quoted" && q.validUntil && !q.decision ? (
                  <Fact label="Válida hasta">{fmtDate(q.validUntil, true)}</Fact>
                ) : null}
                {q.termMonths ? <Fact label="Plazo">{q.termMonths} meses</Fact> : null}
                {q.visitScheduledAt && q.status === "visit_scheduled" ? (
                  <Fact label="Visita técnica">
                    {new Date(q.visitScheduledAt).toLocaleString("es-CO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Fact>
                ) : null}
              </div>
            ) : null}

            {q.group ? (
              <div className="mt-3">
                <GroupProgress group={q.group} compact />
                {q.group.status === "open" ? (
                  <p className={`mt-1 text-xs ${ui.muted}`}>
                    Se aprueba el techo; si al cierre aprueban más conjuntos,
                    el precio baja para todos.
                  </p>
                ) : null}
              </div>
            ) : null}

            {q.scope ? (
              <details className="mt-2">
                <summary className={`cursor-pointer text-xs ${ui.link}`}>Ver alcance</summary>
                <p className={`mt-1 whitespace-pre-line text-xs ${ui.text}`}>{q.scope}</p>
              </details>
            ) : null}

            {q.decision ? (
              <p className={`mt-2 text-xs ${ui.muted}`}>
                La decide el {APPROVAL_CHANNEL_LABELS[q.decision.channel].toLowerCase()}. El
                precio queda en firme mientras deciden ·{" "}
                <Link href="/my-b2b/approvals" className={ui.link}>
                  ver decisión
                </Link>
              </p>
            ) : null}

            {q.status === "accepted" ? (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                Elegida por el conjunto · falta que el proveedor confirme ·{" "}
                <Link href="/my-b2b/contracts" className={ui.link}>
                  ver contrato
                </Link>
              </p>
            ) : null}

            {q.closingReason ? (
              <p className={`mt-2 text-xs ${ui.muted}`}>Motivo: {q.closingReason}</p>
            ) : null}

            {/* Rechazar solo tiene sentido sobre lo cotizado que no esté en
                manos del consejo o del presidente; retirar, sobre lo que el
                proveedor aún no respondió. Aceptar ya no existe: lo decide el
                conjunto. */}
            {selectable || q.status === "requested" || q.status === "visit_scheduled" ? (
              <div className="mt-3">
                {isClosing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      className={ui.input}
                      placeholder={
                        closing.action === "reject"
                          ? "¿Por qué no la tomas? Al proveedor le sirve saber si fue por precio o por plazo."
                          : "¿Por qué retiras la solicitud?"
                      }
                      value={closing.reason}
                      onChange={(e) => setClosing({ ...closing, reason: e.target.value })}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="danger"
                        disabled={shortReason || closeMut.isLoading}
                        onClick={() => closeMut.mutate(closing)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="default"
                        onClick={() => setClosing(null)}
                      >
                        Volver
                      </Button>
                      {shortReason ? (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          Faltan {QUOTE_CLOSING_REASON_MIN - closing.reason.trim().length}{" "}
                          caracteres
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setClosing({
                        id: q.id,
                        action: selectable ? "reject" : "cancel",
                        reason: "",
                      })
                    }
                    className={`text-xs font-medium ${ui.muted} hover:text-red-600 dark:hover:text-red-400`}
                  >
                    {selectable ? "No la tomo" : "Retirar solicitud"}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    );
  };

  const renderRenewal = (c: B2bContract) => {
    const offer = c.renewalOffer!;
    const isSelected = selectedRenewals.includes(offer.id);

    return (
      <label
        key={offer.id}
        className={`${ui.card} flex cursor-pointer items-start gap-3 p-4 transition ${
          isSelected ? "!border-cyan-500 ring-2 ring-cyan-500/20" : ""
        }`}
      >
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-cyan-600"
          checked={isSelected}
          disabled={!isSelected && full}
          onChange={() => toggleRenewal(offer.id)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Renovación · proveedor actual
              </p>
              <h3 className={`font-semibold ${ui.strong}`}>{c.planName}</h3>
              <p className={`text-xs ${ui.muted}`}>
                {c.comercio?.businessName ?? "Proveedor"} · vence el {fmtDate(c.endDate, true)}
              </p>
            </div>
            <Pill tone={offer.changePercent > 0 ? "warning" : "success"}>
              {offer.changePercent > 0 ? "+" : ""}
              {offer.changePercent}%
            </Pill>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact label="Propone">{fmtMoney(offer.amount, c.currency)}</Fact>
            <Fact label="Paga hoy">{fmtMoney(offer.previousAmount, c.currency)}</Fact>
            <Fact label="Plazo">{offer.termMonths} meses</Fact>
          </div>
          {offer.note ? (
            <p className={`mt-2 text-xs italic ${ui.muted}`}>“{offer.note}”</p>
          ) : null}
        </div>
      </label>
    );
  };

  const section = (
    title: string,
    description: string,
    items: ReactNode[],
    right?: ReactNode,
  ) =>
    items.length ? (
      <section className="mt-8">
        <SectionTitle title={title} description={description} right={right} />
        <div className="mt-3 grid gap-3 lg:grid-cols-2">{items}</div>
      </section>
    ) : null;

  const nothing = !isLoading && all.length === 0 && renewalOffers.length === 0;

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        title="Cotizaciones"
        description="Para servicios cuyo precio depende de ir a ver el sitio —fachadas, cubiertas, ascensores—. Cuando tengas las respuestas, marca las que quieres comparar y llévalas a decisión."
        actions={
          <Link
            href="/my-b2b"
            className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          >
            Pedir otra cotización
          </Link>
        }
      />

      {isLoading ? (
        <LoadingCards />
      ) : nothing ? (
        <EmptyState
          icon={<HiOutlineDocumentText />}
          title="Aún no has pedido cotizaciones"
          action={
            <Link href="/my-b2b" className={`text-sm ${ui.link}`}>
              Buscar aliados →
            </Link>
          }
        >
          Entra a un aliado desde el directorio y pídele una cotización a la
          medida. Puede agendar una visita técnica antes de darte precio.
        </EmptyState>
      ) : (
        <>
          {section(
            "Listas para decidir",
            "Marca las del mismo servicio para que el conjunto las compare en un solo cuadro.",
            [...renewalOffers.map(renderRenewal), ...ready.map(renderQuote)],
            full ? (
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Máximo {APPROVAL_MAX_PROPOSALS} por decisión
              </span>
            ) : undefined,
          )}
          {section(
            "Esperando al proveedor",
            "Aún no tienen precio. El proveedor puede agendar una visita antes de cotizar.",
            waiting.map(renderQuote),
            <HiOutlineCalendarDays className={ui.faint} size={18} />,
          )}
          {section(
            "En decisión",
            "Las está decidiendo el consejo o el presidente.",
            inDecision.map(renderQuote),
            <HiOutlineArrowPath className={ui.faint} size={18} />,
          )}

          {history.length ? (
            <details className="mt-8">
              <summary className={`cursor-pointer text-sm font-semibold ${ui.muted}`}>
                Historial ({history.length})
              </summary>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">{history.map(renderQuote)}</div>
            </details>
          ) : null}
        </>
      )}

      {/* Barra fija mientras hay algo marcado: es la acción principal de la
          pantalla y no debe perderse al bajar por la lista. */}
      {totalSelected > 0 ? (
        <div className="sticky bottom-4 z-30 mt-6 flex justify-center">
          <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/40 bg-white/95 p-3 shadow-2xl backdrop-blur dark:bg-slate-900/95">
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${ui.strong}`}>
                {totalSelected === 1
                  ? "1 propuesta marcada"
                  : `${totalSelected} propuestas marcadas`}
              </p>
              <p className={`text-xs ${ui.muted}`}>
                {totalSelected < 3
                  ? "Lo usual es comparar al menos tres."
                  : "Listas para que el conjunto decida."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" rounded="md" colVariant="default" onClick={clearSelection}>
                Desmarcar
              </Button>
              <Button
                size="sm"
                rounded="md"
                colVariant="success"
                onClick={() => setDeciding(true)}
              >
                Llevar a decisión
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ApprovalFormModal
        isOpen={deciding}
        onClose={() => setDeciding(false)}
        quoteIds={selected}
        renewalIds={selectedRenewals}
        defaultTitle={selectedOffers[0]?.planName ?? selectedQuotes[0]?.title ?? ""}
        proposals={[
          ...selectedOffers.map((c) => ({
            key: c.renewalOffer!.id,
            label: `Renovar con ${c.comercio?.businessName ?? "el proveedor actual"} — ${fmtMoney(
              c.renewalOffer!.amount,
              c.currency,
            )}`,
          })),
          ...selectedQuotes.map((q) => ({
            key: q.id,
            label: `${q.comercioName ?? "Proveedor"} — ${priceLine(q) ?? "sin precio"} (${q.quoteNumber})`,
          })),
        ]}
        onCreated={clearSelection}
      />
    </div>
  );
}
