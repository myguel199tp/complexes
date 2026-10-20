"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { TextAreaField } from "@/app/components/ui/form";
import { fileUrl } from "@/app/helpers/fileUrl";
import {
  HomeRequest,
  REQUEST_STATUS,
  RESIDENT_QUOTE_STATUS,
  ResidentHomeQuote,
  acceptHomeQuote,
  cancelHomeRequest,
  confirmHomeVisit,
  confirmHomeWork,
  declineHomeVisit,
  getHomeRequests,
  rejectHomeQuote,
} from "../services/homeServicesService";
import { Overlay, PrivatePhoto, money, when } from "./overlay";

/** Una cotización con lo que el residente puede hacer en su etapa. */
function QuoteCard({
  quote,
  open,
  onAction,
  busy,
}: {
  quote: ResidentHomeQuote;
  open: boolean;
  busy: boolean;
  onAction: (action: "confirmVisit" | "declineVisit" | "accept" | "reject" | "confirm", extra?: { rating?: number; review?: string }) => void;
}) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  return (
    <div className="grid gap-2 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {quote.comercio.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl(quote.comercio.logoUrl) ?? ""} alt="" className="h-8 w-8 rounded-lg object-cover" />
          )}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{quote.comercio.businessName}</span>
        </div>
        <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          {RESIDENT_QUOTE_STATUS[quote.status]}
          {quote.expired && " · venció"}
        </span>
      </div>

      {quote.comercio.phone && (
        <Text size="xs" className="text-gray-500 dark:text-slate-400">
          Contacto: {quote.comercio.phone}
        </Text>
      )}

      {quote.visitAt && (
        <Text size="sm" className="text-gray-700 dark:text-slate-300">
          Visita para medir: {when(quote.visitAt)} · va {quote.visitorName}
        </Text>
      )}

      {quote.items.length > 0 && (
        <div className="grid gap-1 rounded-xl bg-slate-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-slate-300">
          {quote.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span>{item.description}</span>
              <span>{money(item.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900 dark:border-white/10 dark:text-slate-100">
            <span>Total</span>
            <span>{money(quote.amount)}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {quote.advanceAmount ? `Anticipo ${money(quote.advanceAmount)} · ` : ""}
            Empieza {quote.startDate} · {quote.workDays} día(s) · válida hasta {quote.validUntil}
          </span>
          {quote.notes && <span className="text-xs text-gray-500 dark:text-slate-400">{quote.notes}</span>}
        </div>
      )}

      {quote.crew.length > 0 && (
        <Text size="xs" className="text-gray-500 dark:text-slate-400">
          Van a entrar: {quote.crew.map((m) => m.name).join(", ")} (sus pases están en &quot;Mis pases&quot;)
        </Text>
      )}

      {quote.rating && (
        <Text size="xs" className="text-amber-500">
          Tu calificación: {"★".repeat(quote.rating)}
          {"☆".repeat(5 - quote.rating)}
        </Text>
      )}

      {quote.closedReason && (
        <Text size="xs" className="text-gray-400">
          Motivo: {quote.closedReason}
        </Text>
      )}

      <div className="flex flex-wrap gap-2">
        {quote.status === "visit_proposed" && open && (
          <>
            <Button size="xs" rounded="md" colVariant="success" disabled={busy} onClick={() => onAction("confirmVisit")}>
              Confirmar visita
            </Button>
            <Button size="xs" rounded="md" colVariant="default" disabled={busy} onClick={() => onAction("declineVisit")}>
              No me sirve esa fecha
            </Button>
          </>
        )}
        {quote.status === "quoted" && open && !quote.expired && (
          <>
            <Button size="xs" rounded="md" colVariant="success" disabled={busy} onClick={() => onAction("accept")}>
              Aceptar esta cotización
            </Button>
            <Button size="xs" rounded="md" colVariant="default" disabled={busy} onClick={() => onAction("reject")}>
              No la tomo
            </Button>
          </>
        )}
      </div>

      {quote.status === "completed" && (
        <div className="grid gap-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-400/10">
          <Text size="sm" className="text-emerald-800 dark:text-emerald-200">
            ¿Quedó bien? Confirma la obra y califica al negocio.
          </Text>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`text-2xl ${value <= rating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
                aria-label={`${value} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
          <TextAreaField
            placeholder="Cuéntale a otros residentes cómo te fue (opcional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={2}
          />
          <div>
            <Button size="xs" rounded="md" colVariant="success" disabled={busy} onClick={() => onAction("confirm", { rating, review })}>
              Confirmar y calificar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestSheet({
  conjuntoId,
  request,
  onClose,
}: {
  conjuntoId: string;
  request: HomeRequest;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const act = useMutation({
    mutationFn: ({
      action,
      quoteId,
      extra,
    }: {
      action: "confirmVisit" | "declineVisit" | "accept" | "reject" | "confirm" | "cancel";
      quoteId?: string;
      extra?: { rating?: number; review?: string };
    }) => {
      switch (action) {
        case "confirmVisit":
          return confirmHomeVisit(conjuntoId, quoteId!);
        case "declineVisit":
          return declineHomeVisit(conjuntoId, quoteId!);
        case "accept":
          return acceptHomeQuote(conjuntoId, quoteId!);
        case "reject":
          return rejectHomeQuote(conjuntoId, quoteId!);
        case "confirm":
          return confirmHomeWork(conjuntoId, quoteId!, extra?.rating ?? 5, extra?.review || undefined);
        default:
          return cancelHomeRequest(conjuntoId, request.id, reason || undefined);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["home-requests", conjuntoId] });
      const messages: Record<string, string> = {
        confirmVisit: "Visita confirmada: el pase de portería quedó en \"Mis pases\".",
        declineVisit: "Le avisamos al negocio que proponga otra fecha.",
        accept: "¡Contratado! Le avisamos al negocio y a la administración.",
        reject: "Listo, no tomaste esa cotización.",
        confirm: "Gracias por calificar.",
        cancel: "Solicitud cancelada.",
      };
      showAlert(messages[variables.action], "success");
      if (variables.action === "cancel") onClose();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const open = request.status === "open";
  const awarded = request.quotes.find((q) => ["accepted", "completed"].includes(q.status));
  const cancellable = open || (request.status === "awarded" && awarded?.status !== "completed");

  return (
    <Overlay onClose={onClose} wide>
      <div className="grid gap-4">
        <div>
          <Text size="xs" className="text-gray-400">
            {request.number} · {request.tradeLabel} · {REQUEST_STATUS[request.status]}
          </Text>
          <Title as="h2" size="xs" font="bold" colVariant="on">
            {request.title}
          </Title>
          <Text size="sm" className="mt-1 whitespace-pre-line text-gray-600 dark:text-slate-300">
            {request.description}
          </Text>
          {request.photosCount > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: request.photosCount }).map((_, i) => (
                <PrivatePhoto key={i} conjuntoId={conjuntoId} requestId={request.id} index={i} />
              ))}
            </div>
          )}
        </div>

        {request.quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            open={open}
            busy={act.isLoading}
            onAction={(action, extra) => act.mutate({ action, quoteId: quote.id, extra })}
          />
        ))}

        {cancellable && (
          <div className="grid gap-2">
            {cancelling ? (
              <>
                <TextAreaField
                  placeholder="Motivo (opcional, lo ven los negocios)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="xs" rounded="md" colVariant="danger" disabled={act.isLoading} onClick={() => act.mutate({ action: "cancel" })}>
                    {request.status === "awarded" ? "Cancelar la obra" : "Retirar la solicitud"}
                  </Button>
                  <Button size="xs" rounded="md" colVariant="default" onClick={() => setCancelling(false)}>
                    Volver
                  </Button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setCancelling(true)}
                className="w-fit text-xs text-red-600 hover:underline dark:text-red-300"
              >
                {request.status === "awarded" ? "Cancelar la obra" : "Retirar la solicitud"}
              </button>
            )}
          </div>
        )}
      </div>
    </Overlay>
  );
}

/** Lo que el residente ha pedido, con lo que le respondió cada negocio. */
export function MyRequests({ conjuntoId, focusId }: { conjuntoId: string; focusId?: string | null }) {
  const [selected, setSelected] = useState<string | null>(focusId ?? null);

  const query = useQuery({
    queryKey: ["home-requests", conjuntoId],
    queryFn: () => getHomeRequests(conjuntoId),
    enabled: !!conjuntoId,
  });
  const requests = query.data ?? [];
  const current = requests.find((r) => r.id === selected);

  if (query.isLoading) {
    return (
      <Text size="sm" className="text-gray-400">
        Cargando…
      </Text>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15">
        <Text size="sm" className="text-gray-500 dark:text-slate-400">
          Todavía no has pedido cotizaciones.
        </Text>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => {
        const pending = request.quotes.filter((q) => ["visit_proposed", "quoted", "completed"].includes(q.status)).length;
        return (
          <button
            key={request.id}
            type="button"
            onClick={() => setSelected(request.id)}
            className="grid gap-1 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:ring-cyan-500/40 dark:bg-slate-900 dark:ring-white/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {request.tradeLabel} · {request.title}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">{REQUEST_STATUS[request.status]}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {request.number} · {request.quotes.length} negocio(s)
              {pending > 0 && (
                <span className="font-semibold text-cyan-700 dark:text-cyan-300"> · {pending} esperando tu respuesta</span>
              )}
            </span>
          </button>
        );
      })}

      {current && <RequestSheet conjuntoId={conjuntoId} request={current} onClose={() => setSelected(null)} />}
    </div>
  );
}
