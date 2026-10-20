"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Text } from "complexes-next-components";

import { HOME_QUOTE_STATUS, getComercioHomeQuotes } from "../services/homeQuotesService";
import { QuoteDetail } from "./quote-detail";

type Filter = "open" | "work" | "closed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Por responder" },
  { value: "work", label: "Obras" },
  { value: "closed", label: "Cerradas" },
];

/** Las solicitudes que le llegan al negocio, por etapa. */
export function RequestsInbox() {
  const [filter, setFilter] = useState<Filter>("open");
  const [selected, setSelected] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["comercio_home_quotes", filter],
    queryFn: () => getComercioHomeQuotes(filter),
  });
  const quotes = query.data ?? [];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              filter === item.value ? "bg-white/15 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <Text size="sm" className="text-slate-400">
          Cargando…
        </Text>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <Text size="sm" className="text-slate-400">
            {filter === "open"
              ? "No tienes solicitudes por responder."
              : filter === "work"
                ? "No tienes obras en curso."
                : "Todavía no hay solicitudes cerradas."}
          </Text>
        </div>
      ) : (
        <div className="grid gap-3">
          {quotes.map((quote) => (
            <button
              key={quote.id}
              type="button"
              onClick={() => setSelected(quote.id)}
              className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-100">
                  {quote.request.tradeLabel} · {quote.request.title}
                </span>
                <span className={`text-xs font-semibold ${HOME_QUOTE_STATUS[quote.status].tone}`}>
                  {HOME_QUOTE_STATUS[quote.status].text}
                  {quote.expired && " · vencida"}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {quote.request.number} · {quote.conjunto?.name ?? "Conjunto"} ({quote.conjunto?.cityName}) · Apto{" "}
                {quote.request.apartment} · {quote.requester.name}
              </span>
              {quote.amount != null && (
                <span className="text-xs text-slate-300">
                  Cotizado: ${Math.round(quote.amount).toLocaleString("es-CO")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && <QuoteDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
