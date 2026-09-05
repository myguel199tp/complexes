"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { B2B_SERVICE_CATEGORY_LABELS } from "@/app/helpers/b2bServiceCategories";
import {
  B2bQuote,
  QUOTE_CLOSING_REASON_MIN,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_TONE,
  acceptQuote,
  cancelQuote,
  getMyQuotes,
  rejectQuote,
} from "../services/b2bQuoteService";
import { B2bNav } from "../_components/b2b-nav";

const fmtMoney = (value: number, currency: string) =>
  `${value.toLocaleString("es-CO")} ${currency}`;

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : null;

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

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["my_b2b_quotes", conjuntoId],
    queryFn: () => getMyQuotes(conjuntoId),
    enabled: !!conjuntoId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my_b2b_quotes", conjuntoId] });
    // Aceptar deja un contrato pendiente: la pantalla de contratos ya no está
    // al día.
    queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts"] });
  };

  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptQuote(conjuntoId, id),
    onSuccess: () => {
      showAlert(
        "Cotización aceptada. Queda pendiente de que el proveedor confirme la alianza.",
        "success",
      );
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const closeMut = useMutation({
    mutationFn: (p: { id: string; action: "reject" | "cancel"; reason: string }) =>
      p.action === "reject"
        ? rejectQuote(conjuntoId, p.id, p.reason)
        : cancelQuote(conjuntoId, p.id, p.reason),
    onSuccess: () => {
      showAlert("Cotización cerrada", "success");
      setClosing(null);
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const shortReason =
    !!closing && closing.reason.trim().length < QUOTE_CLOSING_REASON_MIN;

  return (
    <div className="w-full p-2">
      <Title size="sm" font="bold" className="text-white">
        Cotizaciones
      </Title>
      <Text size="sm" className="text-slate-400 mt-1">
        Para servicios cuyo precio depende de ir a ver el sitio —fachadas,
        cubiertas, ascensores—. Pídelas desde la ficha de cada aliado.
      </Text>

      <B2bNav />

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">
          Cargando...
        </Text>
      ) : quotes && quotes.length > 0 ? (
        <div className="grid gap-3 mt-6">
          {quotes.map((q: B2bQuote) => {
            const isClosing = closing?.id === q.id;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <Text size="sm" font="semi" className="text-slate-100">
                      {q.title}
                    </Text>
                    <Text size="xs" className="text-slate-400">
                      {q.quoteNumber} ·{" "}
                      {q.categoryOther ??
                        B2B_SERVICE_CATEGORY_LABELS[q.category] ??
                        q.category}
                      {q.comercioName ? ` · ${q.comercioName}` : ""}
                    </Text>
                  </div>
                  <span className={`text-xs ${QUOTE_STATUS_TONE[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>

                {q.visitScheduledAt && q.status === "visit_scheduled" ? (
                  <Text size="xs" className="text-blue-300 mt-2">
                    Visita técnica:{" "}
                    {new Date(q.visitScheduledAt).toLocaleString("es-CO")}
                    {q.visitNotes ? ` · ${q.visitNotes}` : ""}
                  </Text>
                ) : null}

                {q.amount != null ? (
                  <Text size="sm" className="text-slate-200 mt-2">
                    {fmtMoney(q.amount, q.currency)}
                    {q.kind === "recurrente" && q.billingPeriod
                      ? ` / ${q.billingPeriod}`
                      : " · pago único"}
                    {q.pricingModel === "por_apartamento" && q.quantityapt
                      ? ` (${q.quantityapt} apt)`
                      : ""}
                  </Text>
                ) : null}

                {q.scope ? (
                  <Text size="xs" className="text-slate-400 mt-1">
                    <span className="text-slate-300">Alcance:</span> {q.scope}
                  </Text>
                ) : null}

                {q.validUntil && q.status === "quoted" ? (
                  <Text size="xs" className="text-amber-300 mt-1">
                    Válida hasta {fmtDate(q.validUntil)}
                  </Text>
                ) : null}

                {q.closingReason ? (
                  <Text size="xs" className="text-slate-500 mt-1">
                    Motivo: {q.closingReason}
                  </Text>
                ) : null}

                {q.status === "accepted" ? (
                  <Text size="xs" className="text-emerald-300 mt-2">
                    Aceptada. Queda una alianza pendiente de que el proveedor la
                    confirme:{" "}
                    <Link
                      href="/my-b2b/contracts"
                      className="text-cyan-300 hover:text-cyan-200 underline"
                    >
                      ver mis contratos
                    </Link>
                    .
                  </Text>
                ) : null}

                {/* Decidir solo tiene sentido sobre lo cotizado; retirar, solo
                    sobre lo que el proveedor aún no respondió. */}
                {q.status === "quoted" || q.status === "requested" ||
                q.status === "visit_scheduled" ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {q.status === "quoted" ? (
                      <>
                        <Button
                          size="xs"
                          rounded="md"
                          colVariant="success"
                          disabled={acceptMut.isLoading}
                          onClick={() => acceptMut.mutate(q.id)}
                        >
                          Aceptar
                        </Button>
                        <Button
                          size="xs"
                          rounded="md"
                          colVariant="danger"
                          onClick={() =>
                            setClosing(
                              isClosing
                                ? null
                                : { id: q.id, action: "reject", reason: "" },
                            )
                          }
                        >
                          {isClosing ? "Cancelar" : "Rechazar"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="default"
                        onClick={() =>
                          setClosing(
                            isClosing
                              ? null
                              : { id: q.id, action: "cancel", reason: "" },
                          )
                        }
                      >
                        {isClosing ? "Cancelar" : "Retirar solicitud"}
                      </Button>
                    )}
                  </div>
                ) : null}

                {isClosing ? (
                  <div className="mt-3">
                    <textarea
                      className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
                      placeholder={
                        closing.action === "reject"
                          ? "¿Por qué no la tomas? Al proveedor le sirve saber si fue por precio o por plazo."
                          : "¿Por qué retiras la solicitud?"
                      }
                      value={closing.reason}
                      onChange={(e) =>
                        setClosing({ ...closing, reason: e.target.value })
                      }
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        size="xs"
                        rounded="md"
                        colVariant="danger"
                        disabled={shortReason || closeMut.isLoading}
                        onClick={() => closeMut.mutate(closing)}
                      >
                        Confirmar
                      </Button>
                      {shortReason ? (
                        <Text size="xs" className="text-amber-400">
                          Faltan{" "}
                          {QUOTE_CLOSING_REASON_MIN -
                            closing.reason.trim().length}{" "}
                          caracteres
                        </Text>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
          Aún no has pedido cotizaciones. Entra a un aliado desde{" "}
          <Link href="/my-b2b" className="text-cyan-300 hover:text-cyan-200">
            el directorio
          </Link>{" "}
          y pídesela.
        </Text>
      )}
    </div>
  );
}
