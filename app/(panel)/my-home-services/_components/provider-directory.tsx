"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { fileUrl } from "@/app/helpers/fileUrl";
import {
  HomeProvider,
  HomeRequest,
  HomeTrade,
  getHomeProvider,
  getHomeProviders,
} from "../services/homeServicesService";
import { Overlay } from "./overlay";
import { RequestForm } from "./request-form";

const MAX_SELECTED = 3;

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-xs text-gray-400">Sin calificaciones</span>;
  return (
    <span className="text-xs text-amber-500">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))} <span className="text-gray-500 dark:text-slate-400">{rating}</span>
    </span>
  );
}

/** Ficha completa: fotos de trabajos y opiniones de otros residentes. */
function ProviderSheet({
  conjuntoId,
  comercioId,
  onClose,
}: {
  conjuntoId: string;
  comercioId: string;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ["home-provider", conjuntoId, comercioId],
    queryFn: () => getHomeProvider(conjuntoId, comercioId),
  });
  const p = query.data;

  return (
    <Overlay onClose={onClose} wide>
      {!p ? (
        <Text size="sm" className="text-gray-500">
          {query.isError ? (query.error as Error).message : "Cargando…"}
        </Text>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            {p.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(p.logoUrl) ?? ""} alt="" className="h-14 w-14 rounded-xl object-cover" />
            )}
            <div>
              <Title as="h2" size="xs" font="bold" colVariant="on">
                {p.businessName}
              </Title>
              <Text size="xs" className="text-gray-500 dark:text-slate-400">
                {p.tradeLabels.join(" · ")}
                {p.yearsExperience ? ` · ${p.yearsExperience} años de experiencia` : ""}
              </Text>
            </div>
          </div>
          {p.headline && <Text size="sm" className="font-semibold text-slate-800 dark:text-slate-100">{p.headline}</Text>}
          {p.description && (
            <Text size="sm" className="whitespace-pre-line text-gray-600 dark:text-slate-300">
              {p.description}
            </Text>
          )}
          {p.portfolioImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {p.portfolioImages.map((path) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={path} src={fileUrl(path) ?? ""} alt="" className="h-28 w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div className="grid gap-2">
            <Text size="sm" className="font-semibold text-slate-800 dark:text-slate-100">
              Lo que dicen otros residentes ({p.jobsDone} obra{p.jobsDone === 1 ? "" : "s"})
            </Text>
            {p.reviews.length === 0 ? (
              <Text size="xs" className="text-gray-400">
                Todavía no tiene obras confirmadas en la app.
              </Text>
            ) : (
              p.reviews.map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <Stars rating={r.rating} />
                  <Text size="xs" className="text-gray-500 dark:text-slate-400">
                    {r.tradeLabel} · {new Date(r.confirmedAt).toLocaleDateString("es-CO")}
                  </Text>
                  {r.review && <Text size="sm" className="mt-1 text-gray-700 dark:text-slate-200">{r.review}</Text>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Overlay>
  );
}

/**
 * El directorio: negocios con cobertura en la ciudad del conjunto, por oficio.
 * Se eligen hasta tres para pedirles la misma cotización y comparar.
 */
export function ProviderDirectory({
  conjuntoId,
  trades,
  onRequested,
}: {
  conjuntoId: string;
  trades: { value: HomeTrade; label: string }[];
  onRequested: (request: HomeRequest) => void;
}) {
  const [trade, setTrade] = useState<HomeTrade | undefined>();
  const [selected, setSelected] = useState<HomeProvider[]>([]);
  const [sheetOf, setSheetOf] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const query = useQuery({
    queryKey: ["home-providers", conjuntoId, trade ?? "all"],
    queryFn: () => getHomeProviders(conjuntoId, trade),
    enabled: !!conjuntoId,
  });
  const providers = query.data ?? [];
  const tradeLabels = Object.fromEntries(trades.map((t) => [t.value, t.label]));

  const toggle = (provider: HomeProvider) =>
    setSelected((prev) =>
      prev.some((p) => p.comercioId === provider.comercioId)
        ? prev.filter((p) => p.comercioId !== provider.comercioId)
        : prev.length >= MAX_SELECTED
          ? prev
          : [...prev, provider],
    );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTrade(undefined)}
          className={`rounded-full border px-3 py-1 text-xs ${
            !trade
              ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-400/15 dark:text-cyan-200"
              : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          Todos
        </button>
        {trades.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTrade(t.value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              trade === t.value
                ? "border-cyan-600 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-400/15 dark:text-cyan-200"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-400/30 dark:bg-cyan-400/10">
          <Text size="sm" className="text-cyan-900 dark:text-cyan-100">
            Elegiste {selected.map((p) => p.businessName).join(", ")} ({selected.length}/{MAX_SELECTED})
          </Text>
          <Button size="sm" rounded="md" colVariant="success" onClick={() => setAsking(true)}>
            Pedir cotización
          </Button>
        </div>
      )}

      {query.isLoading ? (
        <Text size="sm" className="text-gray-400">
          Buscando negocios…
        </Text>
      ) : query.isError ? (
        <Text size="sm" className="text-red-600 dark:text-red-300">
          {(query.error as Error).message}
        </Text>
      ) : providers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15">
          <Text size="sm" className="text-gray-500 dark:text-slate-400">
            Todavía no hay negocios de {trade ? tradeLabels[trade]?.toLowerCase() : "obras"} atendiendo tu ciudad.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => {
            const isSelected = selected.some((s) => s.comercioId === p.comercioId);
            return (
              <div
                key={p.comercioId}
                className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 dark:bg-slate-900 ${
                  isSelected ? "ring-2 ring-cyan-500" : "ring-black/5 dark:ring-white/10"
                }`}
              >
                <div className="grid h-28 grid-cols-3 gap-0.5 bg-slate-100 dark:bg-white/5">
                  {p.preview.slice(0, 3).map((path) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={path} src={fileUrl(path) ?? ""} alt="" className="h-28 w-full object-cover" />
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{p.businessName}</span>
                  <Stars rating={p.rating} />
                  <span className="text-xs text-gray-500 dark:text-slate-400">{p.tradeLabels.join(" · ")}</span>
                  {p.headline && <span className="text-sm text-gray-700 dark:text-slate-300">{p.headline}</span>}
                  <div className="mt-auto flex gap-2 pt-3">
                    <Button size="xs" rounded="md" colVariant="default" onClick={() => setSheetOf(p.comercioId)}>
                      Ver
                    </Button>
                    <Button
                      size="xs"
                      rounded="md"
                      colVariant={isSelected ? "warning" : "primary"}
                      disabled={!isSelected && selected.length >= MAX_SELECTED}
                      onClick={() => toggle(p)}
                    >
                      {isSelected ? "Quitar" : "Elegir"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sheetOf && <ProviderSheet conjuntoId={conjuntoId} comercioId={sheetOf} onClose={() => setSheetOf(null)} />}

      {asking && (
        <RequestForm
          conjuntoId={conjuntoId}
          providers={selected}
          tradeLabels={tradeLabels}
          initialTrade={trade}
          onClose={() => setAsking(false)}
          onCreated={(request) => {
            setAsking(false);
            setSelected([]);
            onRequested(request);
          }}
        />
      )}
    </div>
  );
}
