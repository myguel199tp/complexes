"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";
import { IoClose } from "react-icons/io5";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField, TextAreaField } from "@/app/components/ui/form";
import {
  ComercioHomeQuote,
  HOME_QUOTE_STATUS,
  PassCode,
  completeHomeWork,
  declineHomeQuote,
  getComercioHomeQuote,
  homeQuotePhotoUrl,
  markHomeAdvancePaid,
  markHomeBalancePaid,
  proposeHomeVisit,
  sendHomeQuote,
  setHomeCrew,
} from "../services/homeQuotesService";

const money = (value: number | null | undefined) =>
  value == null ? "—" : `$${Math.round(value).toLocaleString("es-CO")}`;

const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const OPEN = ["requested", "visit_proposed", "visit_scheduled", "quoted"];

function Pass({ title, pass }: { title: string; pass: Partial<PassCode> & { name?: string } }) {
  if (!pass.code) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {pass.qr && <img src={pass.qr} alt="QR del pase" className="h-20 w-20 rounded bg-white p-1" />}
      <div className="text-xs text-slate-300">
        <p className="font-semibold text-slate-100">{title}</p>
        <p className="font-mono">{pass.code}</p>
        <p className="text-slate-500">
          {pass.status === "ACTIVE" ? "Activo" : pass.status} · hasta {when(pass.validTo ?? null)}
        </p>
      </div>
    </div>
  );
}

/** Una solicitud con todo lo que el negocio puede hacer en su etapa. */
export function QuoteDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [panel, setPanel] = useState<"visit" | "quote" | "decline" | "crew" | null>(null);

  const query = useQuery({
    queryKey: ["comercio_home_quote", id],
    queryFn: () => getComercioHomeQuote(id),
  });
  const quote = query.data;

  const done = (data: ComercioHomeQuote, message: string) => {
    queryClient.setQueryData(["comercio_home_quote", id], data);
    queryClient.invalidateQueries({ queryKey: ["comercio_home_quotes"] });
    setPanel(null);
    showAlert(message, "success");
  };
  const onError = (e: Error) => showAlert(e.message, "error");

  // ── Formularios ──
  const [visit, setVisit] = useState({ visitAt: "", visitorName: "", visitorDocument: "" });
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [terms, setTerms] = useState({
    advanceAmount: "",
    startDate: plusDays(7),
    workDays: "3",
    validUntil: plusDays(10),
    notes: "",
  });
  const [reason, setReason] = useState("");
  const [crew, setCrew] = useState([{ name: "", document: "" }]);
  const [reschedule, setReschedule] = useState({ startDate: "", workDays: "" });

  const proposeMut = useMutation({
    mutationFn: () =>
      proposeHomeVisit(id, {
        visitAt: new Date(visit.visitAt).toISOString(),
        visitorName: visit.visitorName,
        visitorDocument: visit.visitorDocument || undefined,
      }),
    onSuccess: (data) => done(data, "Visita propuesta. Te avisamos cuando el residente la confirme."),
    onError,
  });

  const quoteMut = useMutation({
    mutationFn: () =>
      sendHomeQuote(id, {
        items: items
          .filter((i) => i.description.trim() && Number(i.amount) > 0)
          .map((i) => ({ description: i.description.trim(), amount: Number(i.amount) })),
        advanceAmount: terms.advanceAmount ? Number(terms.advanceAmount) : undefined,
        startDate: terms.startDate,
        workDays: Number(terms.workDays),
        validUntil: terms.validUntil,
        notes: terms.notes || undefined,
      }),
    onSuccess: (data) => done(data, "Cotización enviada."),
    onError,
  });

  const declineMut = useMutation({
    mutationFn: () => declineHomeQuote(id, reason || undefined),
    onSuccess: (data) => done(data, "Le avisamos al residente que no vas a cotizar."),
    onError,
  });

  const crewMut = useMutation({
    mutationFn: () =>
      setHomeCrew(id, {
        members: crew
          .filter((m) => m.name.trim())
          .map((m) => ({ name: m.name.trim(), document: m.document.trim() || undefined })),
        startDate: reschedule.startDate || undefined,
        workDays: reschedule.workDays ? Number(reschedule.workDays) : undefined,
      }),
    onSuccess: (data) => done(data, "Cuadrilla registrada: los pases de portería ya están listos."),
    onError,
  });

  const advanceMut = useMutation({
    mutationFn: () => markHomeAdvancePaid(id),
    onSuccess: (data) => done(data, "Anticipo registrado."),
    onError,
  });
  const balanceMut = useMutation({
    mutationFn: () => markHomeBalancePaid(id),
    onSuccess: (data) => done(data, "Saldo registrado."),
    onError,
  });
  const completeMut = useMutation({
    mutationFn: () => completeHomeWork(id),
    onSuccess: (data) => done(data, "Le pedimos al residente que confirme y califique."),
    onError,
  });

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const open = !!quote && OPEN.includes(quote.status) && quote.request.status === "open";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10"
        >
          <IoClose size={20} />
        </button>

        {!quote ? (
          <Text size="sm" className="text-slate-400">
            {query.isError ? (query.error as Error).message : "Cargando…"}
          </Text>
        ) : (
          <div className="grid gap-5">
            <div>
              <Text size="xs" className="text-slate-500">
                {quote.request.number} · {quote.request.tradeLabel}
              </Text>
              <Title as="h2" size="xs" font="semi" colVariant="on" className="text-lg">
                {quote.request.title}
              </Title>
              <Text size="sm" className={HOME_QUOTE_STATUS[quote.status].tone}>
                {HOME_QUOTE_STATUS[quote.status].text}
                {quote.expired && " · la cotización venció"}
              </Text>
            </div>

            <div className="grid gap-2 text-sm text-slate-300">
              <p className="whitespace-pre-line">{quote.request.description}</p>
              {quote.request.approxMeasures && <p>Medidas: {quote.request.approxMeasures}</p>}
              {quote.request.preferredDates && <p>Cuándo le sirve: {quote.request.preferredDates}</p>}
              {quote.request.photosCount > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {Array.from({ length: quote.request.photosCount }).map((_, i) => (
                    <a key={i} href={homeQuotePhotoUrl(quote.id, i)} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={homeQuotePhotoUrl(quote.id, i)}
                        alt={`Foto ${i + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <p>
                <strong className="text-slate-100">{quote.conjunto?.name}</strong> · Apto {quote.request.apartment}
              </p>
              <p>
                {quote.conjunto?.address}
                {quote.conjunto?.neighborhood ? ` · ${quote.conjunto.neighborhood}` : ""} · {quote.conjunto?.cityName}
              </p>
              <p>
                {quote.requester.name}
                {quote.requester.phone ? ` · ${quote.requester.phone}` : " · el teléfono aparece cuando confirme la visita o acepte"}
              </p>
            </div>

            {quote.visitAt && (
              <div className="grid gap-2">
                <Text size="sm" className="text-slate-200">
                  Visita: {when(quote.visitAt)} · va {quote.visitorName}
                  {quote.status === "visit_proposed" && " (esperando que el residente confirme)"}
                </Text>
                {quote.passes?.visit && <Pass title="Pase de la visita" pass={quote.passes.visit} />}
              </div>
            )}

            {quote.items.length > 0 && (
              <div className="grid gap-1 rounded-2xl border border-purple-400/25 bg-purple-400/5 p-4 text-sm text-slate-300">
                {quote.items.map((item, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span>{item.description}</span>
                    <span>{money(item.amount)}</span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t border-white/10 pt-1 font-semibold text-slate-100">
                  <span>Total</span>
                  <span>{money(quote.amount)}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Anticipo {money(quote.advanceAmount)} · empieza {quote.startDate} · {quote.workDays} día(s) ·
                  válida hasta {quote.validUntil}
                </p>
                {quote.notes && <p className="text-xs text-slate-400">{quote.notes}</p>}
              </div>
            )}

            {quote.passes && quote.passes.crew.length > 0 && (
              <div className="grid gap-2">
                <Text size="sm" className="text-slate-200">
                  Cuadrilla
                </Text>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quote.passes.crew.map((member, i) => (
                    <Pass key={i} title={member.name} pass={member} />
                  ))}
                </div>
              </div>
            )}

            {(quote.advancePaidAt || quote.balancePaidAt) && (
              <Text size="xs" className="text-emerald-300">
                {quote.advancePaidAt && `Anticipo recibido ${when(quote.advancePaidAt)}. `}
                {quote.balancePaidAt && `Saldo recibido ${when(quote.balancePaidAt)}.`}
              </Text>
            )}

            {quote.status === "confirmed" && (
              <Text size="sm" className="text-emerald-300">
                Calificación: {"★".repeat(quote.rating ?? 0)}
                {"☆".repeat(5 - (quote.rating ?? 0))}
                {quote.review ? ` · "${quote.review}"` : ""}
              </Text>
            )}

            {quote.closedReason && (
              <Text size="xs" className="text-slate-400">
                Motivo: {quote.closedReason}
              </Text>
            )}

            {/* ── Acciones ── */}
            {open && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" rounded="md" colVariant="primary" onClick={() => setPanel("visit")}>
                  {quote.visitAt ? "Cambiar la visita" : "Proponer visita para medir"}
                </Button>
                <Button size="sm" rounded="md" colVariant="success" onClick={() => setPanel("quote")}>
                  {quote.status === "quoted" ? "Actualizar cotización" : "Cotizar"}
                </Button>
                <Button size="sm" rounded="md" colVariant="danger" onClick={() => setPanel("decline")}>
                  No cotizar
                </Button>
              </div>
            )}

            {quote.status === "accepted" && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" rounded="md" colVariant="primary" onClick={() => setPanel("crew")}>
                  {quote.crew.length ? "Cambiar cuadrilla" : "Cargar cuadrilla"}
                </Button>
                {!quote.advancePaidAt && !!quote.advanceAmount && (
                  <Button size="sm" rounded="md" colVariant="default" onClick={() => advanceMut.mutate()}>
                    Recibí el anticipo
                  </Button>
                )}
                <Button size="sm" rounded="md" colVariant="success" onClick={() => completeMut.mutate()}>
                  Marcar obra terminada
                </Button>
              </div>
            )}

            {(quote.status === "completed" || quote.status === "confirmed") && !quote.balancePaidAt && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" rounded="md" colVariant="default" onClick={() => balanceMut.mutate()}>
                  Recibí el saldo
                </Button>
              </div>
            )}

            {panel === "visit" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  proposeMut.mutate();
                }}
                className="grid gap-3 rounded-2xl border border-white/10 p-4 sm:grid-cols-3"
              >
                <InputField
                  type="datetime-local"
                  value={visit.visitAt}
                  onChange={(e) => setVisit({ ...visit, visitAt: e.target.value })}
                  helpText="Cuándo"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                  required
                />
                <InputField
                  placeholder="Nombre de quien va"
                  value={visit.visitorName}
                  onChange={(e) => setVisit({ ...visit, visitorName: e.target.value })}
                  helpText="Lo ve la portería"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                  required
                />
                <InputField
                  placeholder="Documento"
                  value={visit.visitorDocument}
                  onChange={(e) => setVisit({ ...visit, visitorDocument: e.target.value })}
                  helpText="Opcional"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                />
                <div className="sm:col-span-3 flex justify-end">
                  <Button type="submit" size="sm" rounded="md" colVariant="primary" disabled={proposeMut.isLoading}>
                    Proponer visita
                  </Button>
                </div>
              </form>
            )}

            {panel === "quote" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  quoteMut.mutate();
                }}
                className="grid gap-3 rounded-2xl border border-white/10 p-4"
              >
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_160px_auto] items-end gap-2">
                    <InputField
                      placeholder="Qué incluye (material, mano de obra…)"
                      value={item.description}
                      onChange={(e) =>
                        setItems(items.map((it, j) => (j === i ? { ...it, description: e.target.value } : it)))
                      }
                      inputSize="md"
                      rounded="md"
                    />
                    <InputField
                      type="number"
                      placeholder="Valor"
                      value={item.amount}
                      onChange={(e) =>
                        setItems(items.map((it, j) => (j === i ? { ...it, amount: e.target.value } : it)))
                      }
                      inputSize="md"
                      rounded="md"
                    />
                    <button
                      type="button"
                      onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : items)}
                      className="pb-2 text-xs text-slate-400 hover:text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setItems([...items, { description: "", amount: "" }])}
                  className="w-fit text-xs text-purple-300 hover:text-purple-200"
                >
                  + Agregar línea
                </button>
                <Text size="sm" className="text-slate-200">
                  Total {money(total)}
                </Text>
                <div className="grid gap-3 sm:grid-cols-4">
                  <InputField
                    type="number"
                    placeholder="Anticipo"
                    value={terms.advanceAmount}
                    onChange={(e) => setTerms({ ...terms, advanceAmount: e.target.value })}
                    helpText="Anticipo (opcional)"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                  <InputField
                    type="date"
                    min={today()}
                    value={terms.startDate}
                    onChange={(e) => setTerms({ ...terms, startDate: e.target.value })}
                    helpText="Empieza"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                  <InputField
                    type="number"
                    min={1}
                    value={terms.workDays}
                    onChange={(e) => setTerms({ ...terms, workDays: e.target.value })}
                    helpText="Días de obra"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                  <InputField
                    type="date"
                    min={today()}
                    value={terms.validUntil}
                    onChange={(e) => setTerms({ ...terms, validUntil: e.target.value })}
                    helpText="Válida hasta"
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                </div>
                <TextAreaField
                  placeholder="Condiciones, garantía, qué pone el residente…"
                  value={terms.notes}
                  onChange={(e) => setTerms({ ...terms, notes: e.target.value })}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" rounded="md" colVariant="success" disabled={quoteMut.isLoading || total <= 0}>
                    Enviar cotización por {money(total)}
                  </Button>
                </div>
              </form>
            )}

            {panel === "decline" && (
              <div className="grid gap-3 rounded-2xl border border-white/10 p-4">
                <TextAreaField
                  placeholder="Motivo (lo ve el residente)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button size="sm" rounded="md" colVariant="danger" disabled={declineMut.isLoading} onClick={() => declineMut.mutate()}>
                    No voy a cotizar
                  </Button>
                </div>
              </div>
            )}

            {panel === "crew" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  crewMut.mutate();
                }}
                className="grid gap-3 rounded-2xl border border-white/10 p-4"
              >
                <Text size="xs" className="text-slate-400">
                  Cada persona recibe su pase de portería por los días de la obra. Cambiar la cuadrilla
                  revoca los pases anteriores.
                </Text>
                {crew.map((member, i) => (
                  <div key={i} className="grid grid-cols-[1fr_180px_auto] items-end gap-2">
                    <InputField
                      placeholder="Nombre"
                      value={member.name}
                      onChange={(e) => setCrew(crew.map((m, j) => (j === i ? { ...m, name: e.target.value } : m)))}
                      inputSize="md"
                      rounded="md"
                    />
                    <InputField
                      placeholder="Documento"
                      value={member.document}
                      onChange={(e) =>
                        setCrew(crew.map((m, j) => (j === i ? { ...m, document: e.target.value } : m)))
                      }
                      inputSize="md"
                      rounded="md"
                    />
                    <button
                      type="button"
                      onClick={() => setCrew(crew.length > 1 ? crew.filter((_, j) => j !== i) : crew)}
                      className="pb-2 text-xs text-slate-400 hover:text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCrew([...crew, { name: "", document: "" }])}
                  className="w-fit text-xs text-purple-300 hover:text-purple-200"
                >
                  + Agregar persona
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField
                    type="date"
                    min={today()}
                    value={reschedule.startDate}
                    onChange={(e) => setReschedule({ ...reschedule, startDate: e.target.value })}
                    helpText={`Correr el inicio (hoy: ${quote.startDate})`}
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                  <InputField
                    type="number"
                    min={1}
                    value={reschedule.workDays}
                    onChange={(e) => setReschedule({ ...reschedule, workDays: e.target.value })}
                    helpText={`Días de obra (hoy: ${quote.workDays})`}
                    sizeHelp="xs"
                    inputSize="md"
                    rounded="md"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" rounded="md" colVariant="primary" disabled={crewMut.isLoading}>
                    Registrar y emitir pases
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
