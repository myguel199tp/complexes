"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  announceParcel,
  bogotaToday,
  addDays,
} from "@/app/(panel)/my-citofonia/services/parcelService";

/** El tope del backend: con más anticipación nadie se acuerda. */
const MAX_DAYS_AHEAD = 30;

interface Props {
  conjuntoId: string;
  onDone: () => void;
}

/**
 * "En la tarde me llega un paquete": dicho en la reja lo oye un solo celador y
 * se pierde con el cambio de turno. Aquí queda en la lista de portería.
 */
export default function AnnounceParcelForm({ conjuntoId, onDone }: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const today = bogotaToday();

  const [carrier, setCarrier] = useState("");
  const [description, setDescription] = useState("");
  const [expectedDate, setExpectedDate] = useState(today);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      announceParcel(conjuntoId, {
        carrier: carrier.trim() || undefined,
        description: description.trim() || undefined,
        expectedDate,
        cashOnDelivery,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert("Listo: portería ya sabe que lo esperas", "success");
      queryClient.invalidateQueries({ queryKey: ["my-expected-parcels"] });
      onDone();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <form
      className="mt-3 flex flex-col gap-2 rounded-md border border-cyan-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]"
      onSubmit={(event) => {
        event.preventDefault();
        if (expectedDate) mutation.mutate();
      }}
    >
      {error && (
        <p className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className={ui.label}>Transportadora o tienda</span>
          <input
            className={ui.input}
            value={carrier}
            maxLength={80}
            placeholder="Servientrega, Amazon…"
            onChange={(event) => setCarrier(event.target.value)}
          />
        </label>
        <label>
          <span className={ui.label}>¿Qué es?</span>
          <input
            className={ui.input}
            value={description}
            maxLength={200}
            placeholder="Un sobre, una caja…"
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className={ui.label}>¿Qué día llega?</span>
          <input
            className={ui.input}
            type="date"
            value={expectedDate}
            min={today}
            max={addDays(today, MAX_DAYS_AHEAD)}
            required
            onChange={(event) => setExpectedDate(event.target.value)}
          />
        </label>
        <label>
          <span className={ui.label}>Indicaciones (opcional)</span>
          <input
            className={ui.input}
            value={notes}
            maxLength={200}
            placeholder="Si no estoy, que lo deje"
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
      </div>

      <label className={`flex items-center gap-2 text-sm ${ui.text}`}>
        <input
          type="checkbox"
          checked={cashOnDelivery}
          onChange={(event) => setCashOnDelivery(event.target.checked)}
        />
        Es contraentrega
      </label>

      {cashOnDelivery && (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          Portería no paga por ti. Si llega y no hay quién pague, te avisamos
          para que lo arregles con la transportadora.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={`text-xs font-medium ${ui.muted} hover:underline`}
          onClick={onDone}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!expectedDate || mutation.isLoading}
          className="rounded-md bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
        >
          Avisar a portería
        </button>
      </div>
    </form>
  );
}
