"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField } from "@/app/components/ui/form";
import { HomeQuoteChannel, payHomePlan, quoteHomePlan } from "../services/homeQuotesService";

const money = (value: number, currency = "COP") =>
  `$${Math.round(value).toLocaleString("es-CO")} ${currency}`;

const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * La cobertura se paga por meses: cada ciudad según sus conjuntos activos, con
 * techo en todo el país, más IVA. Renovar la misma cobertura se suma al final;
 * cambiarla reemplaza el plan desde hoy y abona lo que le quedaba.
 */
export function PlanCard({ channel }: { channel: HomeQuoteChannel }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { plan, limits, profile } = channel;
  const [months, setMonths] = useState("1");

  const quote = useMutation({ mutationFn: quoteHomePlan });
  const months_ = Math.min(Math.max(Number(months) || 0, 0), limits.maxMonths);
  const hasCoverage = profile.national || profile.coverageCities.length > 0;

  useEffect(() => {
    if (!months_ || !hasCoverage) return;
    const timer = setTimeout(() => quote.mutate(months_), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months_, hasCoverage, profile.coverageCities.join("|"), profile.national]);

  const pay = useMutation({
    mutationFn: () => payHomePlan(months_),
    onSuccess: () => {
      showAlert("Pago registrado. Ya apareces en tus ciudades.", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio_home_quote_channel"] });
      quote.mutate(months_);
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const q = quote.data;

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <Title as="h2" size="xs" font="semi" colVariant="on">
          {plan.active ? "Plan vigente" : "Sin plan vigente"}
        </Title>
        <Text size="sm" className="mt-1 text-slate-400">
          {plan.active
            ? `${plan.national ? "Todo el país" : plan.cities.join(", ")} · hasta el ${date(plan.expiresAt)} (${plan.daysRemaining} días)`
            : "Los residentes no te ven hasta que pagues tu cobertura."}
        </Text>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        {!hasCoverage ? (
          <Text size="sm" className="text-amber-200">
            Primero elige en &quot;Mi canal&quot; en qué ciudades trabajas o marca todo el país.
          </Text>
        ) : (
          <>
            <div className="max-w-[220px]">
              <InputField
                type="number"
                min={1}
                max={limits.maxMonths}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                helpText={`Meses (máx. ${limits.maxMonths})`}
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            </div>

            {quote.isError && (
              <Text size="sm" colVariant="danger">
                {(quote.error as Error).message}
              </Text>
            )}

            {q && (
              <div className="grid gap-2 rounded-2xl border border-purple-400/25 bg-purple-400/5 p-4">
                {q.national ? (
                  <Text size="sm" className="text-slate-300">
                    Todo el país: {money(q.monthlyPrice, q.currency)} al mes
                  </Text>
                ) : (
                  q.cityPrices.map((c) => (
                    <Text key={c.key} size="sm" className="text-slate-300">
                      {c.city} ({c.conjuntos} conjunto{c.conjuntos === 1 ? "" : "s"}):{" "}
                      {money(c.monthlyPrice, q.currency)} al mes
                    </Text>
                  ))
                )}
                {q.available && (
                  <>
                    <Text size="sm" className="text-slate-400">
                      {money(q.monthlyPrice, q.currency)} × {q.months} mes(es) ={" "}
                      {money(q.subtotal, q.currency)}
                    </Text>
                    {q.creditApplied > 0 && (
                      <Text size="sm" className="text-emerald-300">
                        − {money(q.creditApplied, q.currency)} de lo que le quedaba a tu plan
                      </Text>
                    )}
                    <Text size="sm" className="text-slate-400">
                      IVA ({Math.round(q.taxRate * 100)}%): {money(q.taxAmount, q.currency)}
                    </Text>
                    <Title as="h3" size="xs" font="semi" colVariant="on" className="text-lg">
                      Total {money(q.total, q.currency)}
                    </Title>
                    <Text size="xs" className="text-slate-500">
                      Del {date(q.startsAt)} al {date(q.endsAt)}
                    </Text>
                  </>
                )}
                {q.notes.map((note) => (
                  <Text key={note} size="xs" className="text-amber-300">
                    {note}
                  </Text>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                colVariant="success"
                rounded="md"
                disabled={!q?.available || pay.isLoading}
                onClick={() => pay.mutate()}
              >
                {pay.isLoading ? "Procesando…" : q?.available ? `Pagar ${money(q.total, q.currency)}` : "Pagar"}
              </Button>
            </div>
          </>
        )}
      </div>

      {plan.payments.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <Title as="h3" size="xs" font="semi" colVariant="on">
            Pagos
          </Title>
          <div className="mt-3 grid gap-2">
            {plan.payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-sm text-slate-300"
              >
                <span>
                  {p.reference} · {p.national ? "Todo el país" : p.cities.join(", ")} · {p.months} mes(es)
                  {p.superseded && <span className="text-slate-500"> · reemplazado</span>}
                  {p.simulated && <span className="text-amber-300"> · simulado</span>}
                </span>
                <span>
                  {money(p.total, p.currency)}{" "}
                  <span className="text-xs text-slate-500">
                    ({date(p.startsAt)} → {date(p.endsAt)})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
