"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import {
  HiCheckBadge,
  HiOutlineArrowDownTray,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bPlan,
  B2bProviderDocument,
  B2bRating,
  DOCUMENT_TYPE_LABELS,
  downloadProviderDocument,
  getB2bComercioCompliance,
  getB2bComercioPlans,
  getB2bComercioRatings,
} from "../services/b2bAllianceService";
import {
  B2bDemandCategory,
  DEMAND_CATEGORY_LABELS,
} from "../services/b2bDemandService";
import {
  CreateB2bQuoteInput,
  createQuote,
} from "../services/b2bQuoteService";
import { QuoteFormModal } from "../quotes/_components/quote-form-modal";
import { StarRating } from "../_components/star-rating";
import { ApprovalFormModal } from "../_components/approval-form-modal";
import {
  Callout,
  EmptyState,
  LoadingCards,
  PageHeader,
  PERIOD_SHORT,
  Pill,
  SectionTitle,
  fmtDate,
  fmtMoney,
  ui,
} from "../_components/b2b-ui";

export default function MyB2bComercioPage() {
  const params = useParams<{ comercioId: string }>();
  const comercioId = params.comercioId;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  // Servicio con el que se llegó desde el buscador. Si venías buscando
  // ascensores, el catálogo abre en ascensores y no en todo lo que vende.
  const searchParams = useSearchParams();
  const category =
    (searchParams.get("category") as B2bDemandCategory | null) ?? undefined;
  const name = searchParams.get("name") ?? "Proveedor";

  const { data: plans, isLoading } = useQuery({
    queryKey: ["my_b2b_plans", conjuntoId, comercioId, category],
    queryFn: () => getB2bComercioPlans(conjuntoId, comercioId, category),
    enabled: !!conjuntoId && !!comercioId,
  });

  const { data: ratings } = useQuery({
    queryKey: ["my_b2b_ratings", conjuntoId, comercioId],
    queryFn: () => getB2bComercioRatings(conjuntoId, comercioId),
    enabled: !!conjuntoId && !!comercioId,
  });

  const average =
    ratings && ratings.length > 0
      ? Math.round(
          (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10,
        ) / 10
      : null;

  const { data: compliance } = useQuery({
    queryKey: ["my_b2b_compliance", conjuntoId, comercioId],
    queryFn: () => getB2bComercioCompliance(conjuntoId, comercioId),
    enabled: !!conjuntoId && !!comercioId,
  });

  const downloadMut = useMutation({
    mutationFn: (doc: B2bProviderDocument) =>
      downloadProviderDocument(conjuntoId, comercioId, doc.id, doc.fileName),
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const [quoteOpen, setQuoteOpen] = useState(false);

  const quoteMut = useMutation({
    mutationFn: (payload: CreateB2bQuoteInput) => createQuote(conjuntoId, payload),
    onSuccess: () => {
      setQuoteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my_b2b_quotes"] });
      showAlert(
        "Cotización solicitada. Te avisamos cuando el proveedor responda.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  // Plan que se está llevando a decisión. Contratar no es un clic de la
  // administración: lo decide el consejo o el presidente.
  const [decidingPlan, setDecidingPlan] = useState<B2bPlan | null>(null);

  const verified = compliance?.status.verified ?? false;

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        back={{ href: "/my-b2b", label: "Volver a aliados" }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {name}
            {compliance ? (
              verified ? (
                <Pill tone="success">Proveedor verificado</Pill>
              ) : (
                <Pill tone="warning">Sin verificar</Pill>
              )
            ) : null}
          </span>
        }
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StarRating value={average} count={ratings?.length} size="md" />
            <span>· Compara sus planes o pídele una cotización a la medida.</span>
          </span>
        }
        actions={
          <Button size="sm" rounded="md" colVariant="primary" onClick={() => setQuoteOpen(true)}>
            Pedir cotización
          </Button>
        }
      />

      {/* ─── Planes ─── */}
      <section className="mt-8">
        <SectionTitle
          title={
            category
              ? `Planes de ${DEMAND_CATEGORY_LABELS[category] ?? category}`
              : "Planes publicados"
          }
          description="Para contratar un plan, llévalo a decisión del consejo o del presidente. Si lo aprueban, el proveedor confirma la alianza."
          right={
            category ? (
              <Link href={`/my-b2b/${comercioId}?name=${encodeURIComponent(name)}`} className={`text-sm ${ui.link}`}>
                Ver todos sus planes
              </Link>
            ) : undefined
          }
        />

        {isLoading ? (
          <LoadingCards count={2} />
        ) : plans && plans.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((p: B2bPlan) => (
              <article key={p.id} className={`${ui.card} flex flex-col p-5`}>
                {p.category ? (
                  <span className="w-fit rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
                    {DEMAND_CATEGORY_LABELS[p.category] ?? p.category}
                  </span>
                ) : null}
                <h3 className={`mt-2 text-lg font-semibold ${ui.strong}`}>{p.name}</h3>
                <p className={`mt-1 line-clamp-4 text-sm ${ui.muted}`}>{p.description}</p>

                <div className={`mt-4 border-t pt-4 ${ui.divider}`}>
                  <p className={`text-2xl font-bold ${ui.strong}`}>
                    {fmtMoney(p.price, p.currency)}
                    <span className={`text-sm font-normal ${ui.muted}`}>
                      {" "}
                      / {PERIOD_SHORT[p.billingPeriod] ?? p.billingPeriod}
                    </span>
                  </p>
                  <p className={`text-xs ${ui.faint}`}>
                    {p.pricingModel === "por_apartamento"
                      ? "Por apartamento: el total depende del tamaño del conjunto"
                      : "Precio fijo"}
                    {p.termMonths ? ` · contrato por ${p.termMonths} meses` : ""}
                  </p>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    colVariant="success"
                    size="sm"
                    rounded="md"
                    className="w-full"
                    onClick={() => setDecidingPlan(p)}
                  >
                    Llevar a decisión
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<HiOutlineClipboardDocumentList />}
            title={
              category
                ? `No tiene planes de ${DEMAND_CATEGORY_LABELS[category] ?? category}`
                : "Aún no tiene planes publicados"
            }
            action={
              <Button size="sm" rounded="md" colVariant="primary" onClick={() => setQuoteOpen(true)}>
                Pedir cotización
              </Button>
            }
          >
            Pídele una cotización a la medida: puede agendar una visita técnica
            antes de darte precio.
          </EmptyState>
        )}
      </section>

      {/* Cumplimiento antes que reputación: una nota de 5 estrellas no cubre
          al conjunto si el operario que entra no tiene ARL. */}
      <section className="mt-10">
        <SectionTitle
          title="Documentos del proveedor"
          description="Tu conjunto responde solidariamente por el proveedor que contrata. Estos son los soportes vigentes y revisados por la plataforma."
        />

        {compliance && compliance.status.missing.length > 0 ? (
          <div className="mt-3">
            <Callout tone="warning" title="Le falta al día">
              {compliance.status.missing.map((t) => DOCUMENT_TYPE_LABELS[t] ?? t).join(", ")}.
            </Callout>
          </div>
        ) : null}

        {compliance && compliance.items.length > 0 ? (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {compliance.items.map((doc) => (
                <div
                  key={doc.id}
                  className={`${ui.card} flex items-center justify-between gap-3 p-3`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <HiCheckBadge size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-medium ${ui.strong}`}>{doc.label}</p>
                      <p className={`text-xs ${ui.faint}`}>
                        {doc.issuer ? `${doc.issuer} · ` : ""}
                        {doc.expiresAt ? `vence el ${fmtDate(doc.expiresAt, true)}` : "no vence"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Descargar"
                    aria-label={`Descargar ${doc.label}`}
                    onClick={() => downloadMut.mutate(doc)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                  >
                    <HiOutlineArrowDownTray size={18} />
                  </button>
                </div>
              ))}
            </div>
            <p className={`mt-2 text-xs ${ui.faint}`}>
              Descargar los soportes requiere tener o haber tenido una alianza con
              este proveedor.
            </p>
          </>
        ) : compliance ? (
          <p className={`mt-3 inline-flex items-center gap-1.5 text-sm ${ui.muted}`}>
            <HiOutlineExclamationTriangle /> Aún no tiene soportes vigentes registrados.
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <SectionTitle
          title="Lo que dicen otros conjuntos"
          right={<StarRating value={average} count={ratings?.length} size="md" />}
        />

        {ratings && ratings.length > 0 ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {ratings.map((r: B2bRating) => (
              <div key={r.id} className={`${ui.card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={r.rating} showValue={false} />
                  <span className={`text-xs ${ui.faint}`}>{fmtDate(r.createdAt, true)}</span>
                </div>
                {r.comment ? (
                  <p className={`mt-2 text-sm ${ui.text}`}>“{r.comment}”</p>
                ) : null}
                <p className={`mt-2 text-xs ${ui.muted}`}>{r.conjuntoName}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`mt-3 text-sm ${ui.muted}`}>
            Ningún conjunto ha calificado a esta empresa todavía.
          </p>
        )}
      </section>

      <QuoteFormModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        isSaving={quoteMut.isLoading}
        comercioId={comercioId}
        comercioName={name}
        onSubmit={(payload) => quoteMut.mutate(payload)}
      />

      <ApprovalFormModal
        isOpen={!!decidingPlan}
        onClose={() => setDecidingPlan(null)}
        planIds={decidingPlan ? [decidingPlan.id] : []}
        defaultTitle={decidingPlan?.name ?? ""}
        proposals={
          decidingPlan
            ? [
                {
                  key: decidingPlan.id,
                  label: `${name}: ${decidingPlan.name} — ${fmtMoney(decidingPlan.price, decidingPlan.currency)} / ${PERIOD_SHORT[decidingPlan.billingPeriod]}${
                    decidingPlan.pricingModel === "por_apartamento" ? " por apartamento" : ""
                  }`,
                },
              ]
            : []
        }
      />
    </div>
  );
}
