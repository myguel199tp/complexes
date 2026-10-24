"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaUserCircle } from "react-icons/fa";
import StarRating from "@/app/components/ui/star-rating";
import {
  createGuestReviewService,
  pendingGuestReviewsService,
} from "../../../services/guestReviewService";
import { PendingGuestReview } from "../../../services/response/pendingGuestReviewResponse";

const PENDING_KEY = ["pending-guest-reviews"];

const formatDay = (day?: string | null): string =>
  day ? new Date(`${day}T12:00:00`).toLocaleDateString("es-CO") : "-";

const EMPTY_STAR = "text-slate-300 dark:text-white/20";

/**
 * Huéspedes que el anfitrión todavía puede calificar. Va sobre el fondo del
 * panel, no en un modal, así que cada color lleva su par `dark:`. Si no hay
 * nada pendiente no se pinta.
 */
export default function GuestReviewsPanel() {
  const { data: pending = [] } = useQuery<PendingGuestReview[]>({
    queryKey: PENDING_KEY,
    queryFn: pendingGuestReviewsService,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (pending.length === 0) return null;

  return (
    <section className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
      <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">
        Califica a tus huéspedes
      </h2>
      <p className="mt-0.5 text-sm text-amber-900/80 dark:text-amber-100/80">
        Tu calificación ayuda a otros anfitriones. Ninguno de los dos ve lo que
        escribió el otro hasta que ambos califican o vence el plazo.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pending.map((item) => (
          <GuestReviewCard key={item.bookingId} item={item} />
        ))}
      </div>
    </section>
  );
}

function GuestReviewCard({ item }: { item: PendingGuestReview }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      createGuestReviewService({
        bookingId: item.bookingId,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_KEY });
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "Error al guardar la reseña"),
  });

  const handleSave = () => {
    if (!rating) {
      setError("Selecciona una calificación");
      return;
    }
    setError(null);
    save.mutate();
  };

  const reputation = item.huesped.calificacion;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FaUserCircle
            className="shrink-0 text-cyan-700 dark:text-cyan-300"
            size={22}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {item.huesped.nombre || "Huésped"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reputation
                ? `★ ${reputation.promedio} · ${reputation.total} ${
                    reputation.total === 1 ? "estadía" : "estadías"
                  }`
                : "Sin calificaciones todavía"}
            </p>
          </div>
        </div>
        {item.huespedYaCalifico && (
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            Ya te calificó
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {item.inmueble.nombre} · {formatDay(item.fechas.entrada)} →{" "}
        {formatDay(item.fechas.salida)}
      </p>

      <div className="mt-2 space-y-2">
        <StarRating
          value={rating}
          onChange={setRating}
          emptyClassName={EMPTY_STAR}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          placeholder="¿Cómo fue como huésped? (opcional)"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        )}
        <button
          onClick={handleSave}
          disabled={save.isPending}
          className="w-full rounded-lg bg-green-600 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        >
          {save.isPending ? "Guardando..." : "Enviar calificación"}
        </button>
        <p className="text-[11px] text-slate-500 dark:text-slate-500">
          Puedes calificar hasta el {formatDay(item.venceEl)}.
        </p>
      </div>
    </div>
  );
}
