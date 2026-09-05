"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
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
  requestB2bContract,
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

const PERIOD_LABEL: Record<string, string> = {
  mensual: "mensual",
  semestral: "semestral",
  anual: "anual",
};

export default function MyB2bComercioPage() {
  const params = useParams<{ comercioId: string }>();
  const comercioId = params.comercioId;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((s) => s.showAlert);

  // Servicio con el que se llegó desde el buscador. Si venías buscando
  // ascensores, el catálogo abre en ascensores y no en todo lo que vende.
  const searchParams = useSearchParams();
  const category =
    (searchParams.get("category") as B2bDemandCategory | null) ?? undefined;

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
    mutationFn: (payload: CreateB2bQuoteInput) =>
      createQuote(conjuntoId, payload),
    onSuccess: () => {
      setQuoteOpen(false);
      showAlert(
        "Cotización solicitada. Te avisamos cuando el proveedor responda.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const requestMut = useMutation({
    mutationFn: (planId: string) =>
      requestB2bContract(conjuntoId, { planId }),
    onSuccess: () => {
      showAlert(
        "Solicitud enviada. El comercio debe confirmarla.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="w-full p-2">
      <Link href="/my-b2b" className="text-cyan-300 text-sm hover:text-cyan-200">
        ← Volver a aliados
      </Link>

      <Title size="sm" font="bold" className="text-white mt-2">
        Planes disponibles
      </Title>
      <Text size="sm" className="text-slate-400 mt-1">
        Al solicitar un plan, queda pendiente hasta que el comercio lo confirme.
      </Text>

      {/* La salida para lo que el catálogo no cubre. Va arriba y no al final
          de la lista: quien necesita impermeabilizar una cubierta no va a
          encontrar un plan que le sirva, y hacerle recorrer todo el catálogo
          antes de ofrecerle esta puerta es hacerle perder el tiempo. */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between gap-3 flex-wrap">
        <Text size="sm" className="text-slate-300">
          ¿Necesitas algo que no está en sus planes? Pídele una cotización a la
          medida: puede agendar una visita técnica antes de darte precio.
        </Text>
        <Button
          size="sm"
          rounded="md"
          colVariant="primary"
          onClick={() => setQuoteOpen(true)}
        >
          Pedir cotización
        </Button>
      </div>

      <QuoteFormModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        isSaving={quoteMut.isLoading}
        comercioId={comercioId}
        onSubmit={(payload) => quoteMut.mutate(payload)}
      />

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {plans.map((p: B2bPlan) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col"
            >
              <span className="font-semibold text-slate-100">{p.name}</span>
              {p.category ? (
                <span className="text-[10px] mt-1 w-fit px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {DEMAND_CATEGORY_LABELS[p.category] ?? p.category}
                </span>
              ) : null}
              <span className="text-slate-400 text-xs mt-1">
                {p.description}
              </span>
              <span className="text-slate-200 text-sm mt-2">
                {p.price} {p.currency} / {PERIOD_LABEL[p.billingPeriod]}
                {p.pricingModel === "por_apartamento"
                  ? " · por apartamento"
                  : ""}
              </span>
              <Button
                colVariant="success"
                size="sm"
                rounded="md"
                className="mt-3"
                disabled={requestMut.isLoading}
                onClick={() => requestMut.mutate(p.id)}
              >
                {requestMut.isLoading ? "Enviando..." : "Solicitar alianza"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
          {category
            ? `Este comercio no tiene planes de ${DEMAND_CATEGORY_LABELS[category] ?? category}.`
            : "Este comercio aún no tiene planes publicados."}
          {category ? (
            <Link
              href={`/my-b2b/${comercioId}`}
              className="text-cyan-300 hover:text-cyan-200 ml-1"
            >
              Ver todos sus planes
            </Link>
          ) : null}
        </Text>
      )}

      {/* Cumplimiento antes que reputación: una nota de 5 estrellas no cubre
          al conjunto si el operario que entra no tiene ARL. */}
      <div className="mt-8">
        <div className="flex items-center gap-3 flex-wrap">
          <Title size="sm" font="bold" className="text-white">
            Documentos del proveedor
          </Title>
          {compliance?.status.verified ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              ✓ Proveedor verificado
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Sin verificar
            </span>
          )}
        </div>

        <Text size="sm" className="text-slate-400 mt-1">
          Tu conjunto responde solidariamente por el proveedor que contrata.
          Estos son los soportes que tiene vigentes y revisados.
        </Text>

        {compliance && compliance.status.missing.length > 0 ? (
          <Text size="xs" className="text-amber-300 mt-2">
            Le falta al día:{" "}
            {compliance.status.missing
              .map((t) => DOCUMENT_TYPE_LABELS[t] ?? t)
              .join(", ")}
            .
          </Text>
        ) : null}

        {compliance && compliance.items.length > 0 ? (
          <div className="grid gap-2 mt-3">
            {compliance.items.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <span className="text-slate-200 text-sm">{doc.label}</span>
                  <span className="block text-slate-500 text-xs">
                    {doc.issuer ? `${doc.issuer} · ` : ""}
                    {doc.expiresAt
                      ? `vence ${new Date(doc.expiresAt).toLocaleDateString("es-CO")}`
                      : "no vence"}
                  </span>
                </div>
                <Button
                  size="xs"
                  rounded="md"
                  colVariant="default"
                  onClick={() => downloadMut.mutate(doc)}
                >
                  Descargar
                </Button>
              </div>
            ))}
            <Text size="xs" className="text-slate-500">
              Descargar los soportes requiere tener o haber tenido una alianza
              con este proveedor.
            </Text>
          </div>
        ) : (
          <Text size="sm" className="text-slate-400 mt-3">
            Este proveedor aún no tiene soportes vigentes registrados.
          </Text>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <Title size="sm" font="bold" className="text-white">
            Reputación
          </Title>
          <StarRating value={average} count={ratings?.length} size="md" />
        </div>

        {ratings && ratings.length > 0 ? (
          <div className="grid gap-3 mt-4">
            {ratings.map((r: B2bRating) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={r.rating} showValue={false} />
                  <span className="text-slate-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <Text size="xs" className="text-slate-400 mt-1">{r.conjuntoName}</Text>
                {r.comment ? (
                  <Text size="sm" className="text-slate-300 mt-2">“{r.comment}”</Text>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <Text size="sm" className="text-slate-400 mt-2">
            Ningún conjunto ha calificado a esta empresa todavía.
          </Text>
        )}
      </div>
    </div>
  );
}
