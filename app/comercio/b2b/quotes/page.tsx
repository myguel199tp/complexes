"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Title,
  Text,
  InputField,
  SelectField,
} from "complexes-next-components";
import DateField from "@/app/components/ui/date-field/DateField";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { B2B_SERVICE_CATEGORY_LABELS } from "@/app/helpers/b2bServiceCategories";
import {
  B2bQuote,
  B2bQuoteStatus,
  QUOTE_CLOSING_REASON_MIN,
  QUOTE_SCOPE_MIN,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_TONE,
  RespondQuoteInput,
  declineQuote,
  getQuotes,
  respondQuote,
  scheduleQuoteVisit,
} from "../services/b2bQuotesService";

const FILTERS: { value: B2bQuoteStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "requested", label: "Por responder" },
  { value: "visit_scheduled", label: "Visita agendada" },
  { value: "quoted", label: "Esperando decisión" },
  { value: "accepted", label: "Aceptadas" },
];

const EMPTY_RESPONSE = {
  price: 0,
  kind: "unico" as RespondQuoteInput["kind"],
  billingPeriod: "mensual" as RespondQuoteInput["billingPeriod"],
  pricingModel: "fijo" as RespondQuoteInput["pricingModel"],
  scope: "",
  validUntil: "",
};

export default function ComercioB2bQuotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  useComercioGuard(() => router.push("/comercio/login"));

  const [filter, setFilter] = useState<B2bQuoteStatus | "all">("all");
  // El formulario abierto se guarda por id: dos tarjetas no pueden compartir
  // el mismo borrador de precio.
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [response, setResponse] = useState(EMPTY_RESPONSE);
  const [visitingId, setVisitingId] = useState<string | null>(null);
  const [visitAt, setVisitAt] = useState("");
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["comercio_b2b_quotes", filter],
    queryFn: () => getQuotes(filter === "all" ? undefined : filter),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_quotes"] });
    // Una cotización aceptada aparece como contrato pendiente de confirmar.
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_contracts"] });
  };

  const visitMut = useMutation({
    mutationFn: (p: { id: string; visitScheduledAt: string }) =>
      scheduleQuoteVisit(p.id, { visitScheduledAt: p.visitScheduledAt }),
    onSuccess: () => {
      showAlert("Visita agendada. Le avisamos al conjunto.", "success");
      setVisitingId(null);
      setVisitAt("");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const respondMut = useMutation({
    mutationFn: (p: { id: string; data: RespondQuoteInput }) =>
      respondQuote(p.id, p.data),
    onSuccess: () => {
      showAlert("Cotización enviada", "success");
      setRespondingId(null);
      setResponse(EMPTY_RESPONSE);
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const declineMut = useMutation({
    mutationFn: (p: { id: string; reason: string }) =>
      declineQuote(p.id, p.reason),
    onSuccess: () => {
      showAlert("Cotización declinada", "success");
      setDecliningId(null);
      setDeclineReason("");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const missingScope = Math.max(
    0,
    QUOTE_SCOPE_MIN - response.scope.trim().length,
  );

  const openResponse = (quote: B2bQuote) => {
    setDecliningId(null);
    setVisitingId(null);
    setRespondingId(respondingId === quote.id ? null : quote.id);
    // Precargar lo ya cotizado: corregir un precio es lo normal mientras el
    // conjunto no decide, y volver a teclear todo desde cero invita a que se
    // pierda el alcance que ya estaba escrito.
    setResponse(
      quote.price != null
        ? {
            price: quote.price,
            kind: quote.kind ?? "unico",
            billingPeriod: quote.billingPeriod ?? "mensual",
            pricingModel: quote.pricingModel ?? "fijo",
            scope: quote.scope ?? "",
            validUntil: quote.validUntil?.slice(0, 10) ?? "",
          }
        : EMPTY_RESPONSE,
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Cotizaciones
          </Title>
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver
          </Link>
        </div>

        <Text size="sm" className="text-slate-400 mt-2">
          Trabajos que un conjunto quiere que le cotices. Responder rápido es lo
          que decide la mayoría: una cotización sin respuesta se vence sola.
        </Text>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                filter === f.value
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "text-slate-400 border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">
              Cargando...
            </Text>
          ) : quotes && quotes.length > 0 ? (
            quotes.map((q) => {
              const canAct =
                q.status === "requested" || q.status === "visit_scheduled";

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <Text size="sm" font="semi" className="text-slate-100">
                        {q.title}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {q.quoteNumber} ·{" "}
                        {q.categoryOther ??
                          B2B_SERVICE_CATEGORY_LABELS[q.category] ??
                          q.category}
                      </Text>
                      <Text size="xs" className="text-slate-400">
                        {q.conjuntoName ?? q.conjuntoId}
                        {q.conjuntoCity ? ` · ${q.conjuntoCity}` : ""}
                        {q.quantityapt ? ` · ${q.quantityapt} apt` : ""}
                      </Text>
                    </div>
                    <span className={`text-xs ${QUOTE_STATUS_TONE[q.status]}`}>
                      {QUOTE_STATUS_LABELS[q.status]}
                    </span>
                  </div>

                  <Text size="xs" className="text-slate-300 mt-2">
                    {q.description}
                  </Text>

                  {q.desiredStartDate ? (
                    <Text size="xs" className="text-slate-500 mt-1">
                      Quisieran empezar el{" "}
                      {new Date(q.desiredStartDate).toLocaleDateString("es-CO")}
                    </Text>
                  ) : null}

                  {q.visitScheduledAt ? (
                    <Text size="xs" className="text-blue-300 mt-1">
                      Visita:{" "}
                      {new Date(q.visitScheduledAt).toLocaleString("es-CO")}
                    </Text>
                  ) : null}

                  {q.amount != null ? (
                    <Text size="sm" className="text-slate-200 mt-2">
                      Cotizaste {q.amount.toLocaleString("es-CO")} {q.currency}
                      {q.kind === "recurrente" && q.billingPeriod
                        ? ` / ${q.billingPeriod}`
                        : " · pago único"}
                      {q.validUntil
                        ? ` · válida hasta ${new Date(q.validUntil).toLocaleDateString("es-CO")}`
                        : ""}
                    </Text>
                  ) : null}

                  {q.closingReason ? (
                    <Text size="xs" className="text-slate-500 mt-1">
                      Motivo: {q.closingReason}
                    </Text>
                  ) : null}

                  {q.status === "accepted" ? (
                    <Text size="xs" className="text-emerald-300 mt-2">
                      Aceptaron tu cotización. Confirma la alianza en{" "}
                      <Link
                        href="/comercio/b2b/contracts"
                        className="text-cyan-300 hover:text-cyan-200 underline"
                      >
                        contratos
                      </Link>{" "}
                      para que el servicio arranque.
                    </Text>
                  ) : null}

                  {canAct || q.status === "quoted" ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="success"
                        onClick={() => openResponse(q)}
                      >
                        {respondingId === q.id
                          ? "Cerrar"
                          : q.price != null
                            ? "Corregir cotización"
                            : "Cotizar"}
                      </Button>
                      {canAct ? (
                        <>
                          <Button
                            size="xs"
                            rounded="md"
                            colVariant="default"
                            onClick={() => {
                              setRespondingId(null);
                              setVisitingId(
                                visitingId === q.id ? null : q.id,
                              );
                            }}
                          >
                            {visitingId === q.id
                              ? "Cerrar"
                              : "Agendar visita"}
                          </Button>
                          <Button
                            size="xs"
                            rounded="md"
                            colVariant="danger"
                            onClick={() => {
                              setRespondingId(null);
                              setDecliningId(
                                decliningId === q.id ? null : q.id,
                              );
                            }}
                          >
                            {decliningId === q.id ? "Cerrar" : "No cotizar"}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Agendar visita */}
                  {visitingId === q.id ? (
                    <div className="mt-3 grid gap-2">
                      <InputField
                        type="datetime-local"
                        helpText="Fecha y hora de la visita"
                        sizeHelp="xs"
                        inputSize="sm"
                        rounded="md"
                        value={visitAt}
                        onChange={(e) => setVisitAt(e.target.value)}
                      />
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="primary"
                        disabled={!visitAt || visitMut.isLoading}
                        onClick={() =>
                          visitMut.mutate({
                            id: q.id,
                            visitScheduledAt: new Date(visitAt).toISOString(),
                          })
                        }
                      >
                        Confirmar visita
                      </Button>
                    </div>
                  ) : null}

                  {/* Responder con precio */}
                  {respondingId === q.id ? (
                    <div className="mt-3 grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <InputField
                          regexType="number"
                          type="number"
                          helpText="Precio"
                          sizeHelp="xs"
                          inputSize="sm"
                          rounded="md"
                          placeholder="Precio"
                          value={response.price || ""}
                          onChange={(e) =>
                            setResponse({
                              ...response,
                              price: Number(e.target.value),
                            })
                          }
                        />
                        <SelectField
                          helpText="Modelo de precio"
                          sizeHelp="xs"
                          inputSize="sm"
                          rounded="md"
                          defaultOption="Modelo de precio"
                          options={[
                            { value: "fijo", label: "Precio total" },
                            {
                              value: "por_apartamento",
                              label: "Por apartamento",
                            },
                          ]}
                          value={response.pricingModel}
                          onChange={(e) =>
                            setResponse({
                              ...response,
                              pricingModel: e.target
                                .value as RespondQuoteInput["pricingModel"],
                            })
                          }
                        />
                        <SelectField
                          helpText="Tipo de cobro"
                          sizeHelp="xs"
                          inputSize="sm"
                          rounded="md"
                          defaultOption="Tipo de cobro"
                          options={[
                            { value: "unico", label: "Pago único (obra)" },
                            {
                              value: "recurrente",
                              label: "Servicio recurrente",
                            },
                          ]}
                          value={response.kind}
                          onChange={(e) =>
                            setResponse({
                              ...response,
                              kind: e.target.value as RespondQuoteInput["kind"],
                            })
                          }
                        />
                        {response.kind === "recurrente" ? (
                          <SelectField
                            helpText="Periodo de cobro"
                            sizeHelp="xs"
                            inputSize="sm"
                            rounded="md"
                            defaultOption="Periodo de cobro"
                            options={[
                              { value: "mensual", label: "Mensual" },
                              { value: "semestral", label: "Semestral" },
                              { value: "anual", label: "Anual" },
                            ]}
                            value={response.billingPeriod}
                            onChange={(e) =>
                              setResponse({
                                ...response,
                                billingPeriod: e.target
                                  .value as RespondQuoteInput["billingPeriod"],
                              })
                            }
                          />
                        ) : (
                          <div />
                        )}
                      </div>

                      {response.pricingModel === "por_apartamento" &&
                      q.quantityapt ? (
                        <Text size="xs" className="text-slate-400">
                          Total:{" "}
                          {(
                            (response.price || 0) * q.quantityapt
                          ).toLocaleString("es-CO")}{" "}
                          COP ({q.quantityapt} apartamentos)
                        </Text>
                      ) : null}

                      <textarea
                        className="input-b2b"
                        placeholder="Alcance: qué incluye y qué no. Es lo que manda si después hay desacuerdo."
                        value={response.scope}
                        onChange={(e) =>
                          setResponse({ ...response, scope: e.target.value })
                        }
                      />
                      {missingScope > 0 ? (
                        <Text size="xs" className="text-amber-400">
                          Faltan {missingScope} caracteres en el alcance
                        </Text>
                      ) : null}

                      <DateField
                        label="¿Hasta cuándo sostienes este precio?"
                        value={response.validUntil}
                        onChange={(value) =>
                          setResponse({ ...response, validUntil: value })
                        }
                      />

                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="success"
                        disabled={
                          respondMut.isLoading ||
                          response.price <= 0 ||
                          missingScope > 0 ||
                          !response.validUntil
                        }
                        onClick={() =>
                          respondMut.mutate({
                            id: q.id,
                            data: {
                              price: response.price,
                              kind: response.kind,
                              billingPeriod:
                                response.kind === "recurrente"
                                  ? response.billingPeriod
                                  : undefined,
                              pricingModel: response.pricingModel,
                              scope: response.scope.trim(),
                              validUntil: response.validUntil,
                            },
                          })
                        }
                      >
                        Enviar cotización
                      </Button>
                    </div>
                  ) : null}

                  {/* Declinar */}
                  {decliningId === q.id ? (
                    <div className="mt-3 grid gap-2">
                      <textarea
                        className="input-b2b"
                        placeholder="¿Por qué no cotizas? Al conjunto le sirve saber si es por cobertura, por cupo o por el tipo de trabajo."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                      />
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="danger"
                        disabled={
                          declineMut.isLoading ||
                          declineReason.trim().length <
                            QUOTE_CLOSING_REASON_MIN
                        }
                        onClick={() =>
                          declineMut.mutate({
                            id: q.id,
                            reason: declineReason.trim(),
                          })
                        }
                      >
                        Confirmar
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <Text size="sm" className="text-slate-400">
              No tienes cotizaciones en este filtro.
            </Text>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-b2b {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
