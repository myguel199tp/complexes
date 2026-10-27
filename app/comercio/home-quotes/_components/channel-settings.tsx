"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "complexes-next-components";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField, MultiSelect, SelectField, TextAreaField } from "@/app/components/ui/form";
import { findCountry } from "@/app/helpers/countryCity";
import { fileUrl } from "@/app/helpers/fileUrl";
import {
  HomeQuoteChannel,
  HomeQuoteProfile,
  HomeTrade,
  addPortfolioImages,
  getHomeQuoteCoverageOptions,
  removePortfolioImage,
  updateHomeQuoteChannel,
} from "../services/homeQuotesService";

const conjuntosLabel = (n: number) => `${n} conjunto${n === 1 ? "" : "s"}`;

const formFrom = (profile: HomeQuoteProfile) => ({
  enabled: profile.enabled,
  trades: profile.trades,
  national: profile.national,
  cities: profile.coverageCities,
  headline: profile.headline ?? "",
  description: profile.description ?? "",
});

type ChannelForm = ReturnType<typeof formFrom>;

/** Lo que de verdad se guarda: el backend recorta textos y con "todo el país" vacía las ciudades. */
const savedShape = (f: ChannelForm) =>
  JSON.stringify({
    ...f,
    trades: [...f.trades].sort(),
    cities: f.national ? [] : f.cities,
    headline: f.headline.trim(),
    description: f.description.trim(),
  });

/**
 * Si el residente ya encuentra al negocio. Sale del canal guardado, no del
 * formulario: el directorio pide canal encendido y plan vigente, y la
 * cobertura que cuenta es la pagada, no la que se está editando.
 */
function visibility({ profile, plan }: HomeQuoteChannel) {
  if (!profile.enabled) {
    return {
      visible: false,
      reason: "Hoy no apareces: marca \"Recibir solicitudes de cotización\" y guarda.",
    };
  }
  if (!plan.active) {
    return {
      visible: false,
      reason: "Hoy no apareces: falta pagar la cobertura en \"Plan y cobertura\".",
    };
  }
  return {
    visible: true,
    reason: `Te ven los residentes de conjuntos en ${
      plan.national ? "todo el país" : plan.cities.join(", ")
    }.`,
  };
}

/** Oficios, cobertura y vitrina del canal. */
export function ChannelSettings({ channel }: { channel: HomeQuoteChannel }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { profile, tradeLabels, limits } = channel;

  const [form, setForm] = useState(() => formFrom(profile));
  const [countryId, setCountryId] = useState("");

  useEffect(() => {
    setForm(formFrom(profile));
  }, [profile]);

  // Solo países y ciudades con conjuntos activos: en otra ciudad nadie lo vería.
  const coverageQuery = useQuery({
    queryKey: ["comercio_home_quote_coverage_options"],
    queryFn: getHomeQuoteCoverageOptions,
  });
  const coverage = coverageQuery.data ?? [];

  // Sin elegir, el país de las ciudades guardadas; si no hay, el de más conjuntos.
  const country =
    coverage.find((c) => String(c.countryId) === countryId) ??
    coverage.find((c) => c.cities.some((city) => profile.coverageCities.includes(city.name))) ??
    coverage[0];

  const countryOptions = coverage.map((c) => {
    const known = findCountry(c.countryId);
    return {
      value: String(c.countryId),
      label: `${known?.country ?? c.countryCode ?? c.countryId} · ${conjuntosLabel(c.conjuntos)}`,
      image: known?.flag,
    };
  });

  const cityOptions = [
    ...(country?.cities ?? []).map((city) => ({
      value: city.name,
      label: `${city.name}${city.state ? ` (${city.state})` : ""} · ${conjuntosLabel(city.conjuntos)}`,
    })),
    // Guardadas antes y hoy sin conjuntos: se muestran para poder quitarlas.
    ...form.cities
      .filter((name) => !country?.cities.some((city) => city.name === name))
      .map((name) => ({ value: name, label: `${name} · sin conjuntos activos` })),
  ];

  const dirty = savedShape(form) !== savedShape(formFrom(profile));
  const status = visibility(channel);

  const refresh = (data: HomeQuoteChannel) =>
    queryClient.setQueryData(["comercio_home_quote_channel"], data);
  const onError = (e: Error) => showAlert(e.message, "error");

  const save = useMutation({
    mutationFn: () =>
      updateHomeQuoteChannel({
        enabled: form.enabled,
        trades: form.trades,
        national: form.national,
        coverageCities: form.national ? [] : form.cities,
        headline: form.headline,
        description: form.description,
      }),
    onSuccess: (data) => {
      refresh(data);
      const after = visibility(data);
      showAlert(
        after.visible
          ? "Canal guardado. Ya apareces en \"Servicios para tu hogar\"."
          : `Canal guardado. ${after.reason}`,
        "success",
      );
    },
    onError,
  });

  const upload = useMutation({ mutationFn: addPortfolioImages, onSuccess: refresh, onError });
  const remove = useMutation({ mutationFn: removePortfolioImage, onSuccess: refresh, onError });

  const toggleTrade = (trade: HomeTrade) =>
    setForm((prev) => {
      if (prev.trades.includes(trade)) {
        return { ...prev, trades: prev.trades.filter((t) => t !== trade) };
      }
      if (prev.trades.length >= limits.maxTrades) {
        showAlert(`Elige hasta ${limits.maxTrades} oficios`, "error");
        return prev;
      }
      return { ...prev, trades: [...prev.trades, trade] };
    });

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text size="sm" className="font-semibold text-slate-100">
            Dónde te ven los residentes
          </Text>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status.visible
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-amber-400/20 text-amber-200"
            }`}
          >
            {status.visible ? "Visible" : "No visible"}
          </span>
        </div>
        <Text size="sm" className="mt-2 text-slate-300">
          En su panel, en &quot;Servicios para tu hogar&quot; → &quot;Buscar&quot;.
          Ahí ven tu tarjeta con la frase, los oficios y las fotos, y desde ella
          te piden cotización. Las solicitudes te llegan en la pestaña
          &quot;Solicitudes&quot;.
        </Text>
        <Text size="xs" className="mt-2 text-slate-400">
          {status.reason}
        </Text>
      </div>

      <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Recibir solicitudes de cotización
        </label>

        <div>
          <Text size="sm" className="mb-2 text-slate-300">
            Oficios que haces (hasta {limits.maxTrades})
          </Text>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(tradeLabels) as HomeTrade[]).map((trade) => {
              const on = form.trades.includes(trade);
              return (
                <button
                  key={trade}
                  type="button"
                  onClick={() => toggleTrade(trade)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    on
                      ? "border-purple-400 bg-purple-500/25 text-purple-100"
                      : "border-white/15 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {tradeLabels[trade]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3">
          <Text size="sm" className="text-slate-300">
            Dónde trabajas
          </Text>

          {coverageQuery.isError ? (
            <Text size="xs" colVariant="danger">
              {(coverageQuery.error as Error).message}
            </Text>
          ) : coverageQuery.isLoading ? (
            <Text size="xs" className="text-slate-500">
              Cargando países y ciudades…
            </Text>
          ) : coverage.length === 0 ? (
            <Text size="xs" className="text-amber-300">
              Todavía no hay conjuntos activos en ningún país: no hay dónde mostrarte.
            </Text>
          ) : (
            <SelectField
              searchable
              id="home-quote-country"
              defaultOption="Selecciona el país"
              helpText="País"
              sizeHelp="xs"
              options={countryOptions}
              prefixImage={countryOptions.find((o) => o.value === String(country?.countryId))?.image ?? ""}
              value={String(country?.countryId ?? "")}
              onChange={(e) => {
                // Las ciudades son de un solo país: al cambiarlo se eligen de nuevo.
                if (e.target.value === String(country?.countryId)) return;
                setCountryId(e.target.value);
                setForm((prev) => ({ ...prev, cities: [] }));
              }}
              inputSize="md"
              rounded="md"
            />
          )}

          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.national}
              onChange={(e) => setForm({ ...form, national: e.target.checked })}
            />
            En todo el país
          </label>

          {!form.national && coverage.length > 0 && (
            <>
              <MultiSelect
                searchable
                id="home-quote-cities"
                defaultOption="Selecciona las ciudades donde trabajas"
                helpText="Ciudades"
                sizeHelp="xs"
                options={cityOptions}
                value={form.cities}
                onChange={(cities) => setForm((prev) => ({ ...prev, cities }))}
                inputSize="md"
                rounded="md"
              />
              <Text size="xs" className="text-slate-500">
                Solo salen las ciudades con conjuntos activos: en otras nadie te
                vería. Cada ciudad se paga en el plan según cuántos conjuntos
                activos tiene. Cambiar las ciudades se aplica cuando pagas.
              </Text>
            </>
          )}
        </div>

        <InputField
          placeholder="Ej: Instalamos pisos y cocinas con garantía"
          value={form.headline}
          maxLength={120}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
          helpText="Frase para tu tarjeta en el directorio"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
        />
        <TextAreaField
          placeholder={channel.fallbackDescription ?? "Cuéntale al residente qué haces, cómo trabajas y qué garantía das."}
          value={form.description}
          maxLength={2000}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          helpText="Descripción (si la dejas vacía se usa la de tu perfil)"
          sizeHelp="xs"
          rows={4}
        />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Text size="xs" className={dirty ? "text-amber-300" : "text-slate-500"}>
            {dirty ? "Tienes cambios sin guardar" : "Todo guardado"}
          </Text>
          <Button colVariant="success" rounded="md" disabled={save.isLoading} onClick={() => save.mutate()}>
            {save.isLoading ? "Guardando…" : "Guardar canal"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div>
          <Text size="sm" className="text-slate-200">
            Fotos de trabajos hechos ({profile.portfolioImages.length}/{limits.maxPortfolioImages})
          </Text>
          <Text size="xs" className="text-slate-500">
            Es lo primero que mira un residente antes de pedirte cotización.
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {profile.portfolioImages.map((path) => (
            <div key={path} className="group relative overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileUrl(path) ?? ""} alt="" className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => remove.mutate(path)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        {channel.exists ? (
          profile.portfolioImages.length < limits.maxPortfolioImages && (
            <label className="w-fit cursor-pointer rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10">
              {upload.isLoading ? "Subiendo…" : "Subir fotos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(
                    0,
                    limits.maxPortfolioImages - profile.portfolioImages.length,
                  );
                  if (files.length) upload.mutate(files);
                  e.target.value = "";
                }}
              />
            </label>
          )
        ) : (
          <Text size="xs" className="text-slate-500">
            Guarda el canal primero para poder subir fotos.
          </Text>
        )}
      </div>
    </div>
  );
}
