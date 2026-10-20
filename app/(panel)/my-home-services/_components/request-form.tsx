"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField, SelectField, TextAreaField } from "@/app/components/ui/form";
import {
  HomeProvider,
  HomeRequest,
  HomeTrade,
  createHomeRequest,
} from "../services/homeServicesService";
import { Overlay } from "./overlay";

/**
 * Pedir cotización a uno o varios negocios. El oficio tiene que ser uno que
 * hagan todos los elegidos: la misma solicitud les llega a todos.
 */
export function RequestForm({
  conjuntoId,
  providers,
  tradeLabels,
  initialTrade,
  onClose,
  onCreated,
}: {
  conjuntoId: string;
  providers: HomeProvider[];
  tradeLabels: Record<string, string>;
  initialTrade?: HomeTrade;
  onClose: () => void;
  onCreated: (request: HomeRequest) => void;
}) {
  const showAlert = useAlertStore((s) => s.showAlert);

  const common = (Object.keys(tradeLabels) as HomeTrade[]).filter((trade) =>
    providers.every((p) => p.trades.includes(trade)),
  );

  const [form, setForm] = useState({
    trade: (initialTrade && common.includes(initialTrade) ? initialTrade : common[0]) ?? "",
    title: "",
    description: "",
    approxMeasures: "",
    preferredDates: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const create = useMutation({
    mutationFn: () =>
      createHomeRequest(conjuntoId, {
        trade: form.trade as HomeTrade,
        title: form.title.trim(),
        description: form.description.trim(),
        approxMeasures: form.approxMeasures.trim() || undefined,
        preferredDates: form.preferredDates.trim() || undefined,
        comercioIds: providers.map((p) => p.comercioId),
        photos,
      }),
    onSuccess: (request) => {
      showAlert("Listo: les avisamos a los negocios. Te escribimos cuando respondan.", "success");
      onCreated(request);
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <Overlay onClose={onClose}>
      <Title as="h2" size="xs" font="bold" colVariant="on">
        Pedir cotización
      </Title>
      <Text size="sm" className="mt-1 text-gray-500 dark:text-slate-400">
        A {providers.map((p) => p.businessName).join(", ")}. Con fotos y medidas te pueden cotizar sin ir;
        si necesitan medir, te proponen una visita y la app crea el pase de portería cuando la confirmes.
      </Text>

      {common.length === 0 ? (
        <Text size="sm" className="mt-4 text-amber-600 dark:text-amber-300">
          Los negocios que elegiste no comparten ningún oficio. Elige negocios del mismo oficio.
        </Text>
      ) : (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <SelectField
            options={common.map((trade) => ({ value: trade, label: tradeLabels[trade] }))}
            value={form.trade}
            onChange={(e) => setForm({ ...form, trade: e.target.value })}
            helpText="Oficio"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
          <InputField
            placeholder="Ej: Cambiar el piso de la sala"
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            helpText="Qué necesitas"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            required
          />
          <TextAreaField
            placeholder="Cuéntales el trabajo: qué hay hoy, qué quieres, materiales que te gustan…"
            value={form.description}
            maxLength={2000}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            helpText="Detalle"
            sizeHelp="xs"
            rows={4}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              placeholder="Ej: sala de 4 × 5 m"
              value={form.approxMeasures}
              onChange={(e) => setForm({ ...form, approxMeasures: e.target.value })}
              helpText="Medidas aproximadas (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
            <InputField
              placeholder="Ej: entre semana en la mañana"
              value={form.preferredDates}
              onChange={(e) => setForm({ ...form, preferredDates: e.target.value })}
              helpText="Cuándo te sirve (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10">
              Agregar fotos ({photos.length}/5)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos((prev) => [...prev, ...files].slice(0, 5));
                  e.target.value = "";
                }}
              />
            </label>
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((photo, i) => (
                  <span
                    key={`${photo.name}-${i}`}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  >
                    {photo.name}
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Text size="xs" className="mt-1 text-gray-400">
              Solo las ven los negocios a los que les pides.
            </Text>
          </div>

          <div className="flex justify-end">
            <Button type="submit" colVariant="success" rounded="md" disabled={create.isLoading || !form.trade}>
              {create.isLoading ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      )}
    </Overlay>
  );
}
