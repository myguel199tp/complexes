"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { InputField, Title } from "complexes-next-components";
import { IoArrowBack, IoSend, IoSparkles } from "react-icons/io5";

import { useComercioGuard } from "../_lib/comercio-auth";
import PlanFeatureGate from "../_components/plan-feature-gate";
import { getComercioProfile } from "../_lib/comercio-profile";
import {
  askComercioAssistant,
  getComercioAssistantCapabilities,
  resetComercioAssistantConversation,
  sendComercioAssistantFeedback,
  getWeeklyDigestEnabled,
  setWeeklyDigestEnabled,
  type ComercioAssistantReply,
} from "./services/comercioAssistantService";
import { AssistantMessage, UserMessage } from "./_components/assistant-message";

type ChatEntry =
  | { role: "user"; id: string; text: string }
  | {
      role: "assistant";
      id: string;
      reply: ComercioAssistantReply;
      /** El voto que dio el dueño, si votó. */
      helpful?: boolean;
    };

/**
 * Atajos por modelo de negocio. Un comercio B2B no vende a residentes, así que
 * ofrecerle "¿cuántos pedidos tengo?" solo lo manda a una respuesta vacía.
 */
const B2C_SHORTCUTS = [
  "¿cómo me fue la semana?",
  "¿cuántos pedidos tengo pendientes?",
  "¿cuánto vendí hoy?",
  "¿qué productos están agotados?",
  // La publicidad entra en los atajos aunque desplace a "¿quién está
  // repartiendo?": es lo único que el comercio paga aparte de su plan, y quien
  // acaba de comprar un paquete pregunta por él antes que por el reparto.
  "¿cuántas personas vieron mi anuncio?",
  "¿en qué conjunto me va mejor?",
];

const B2B_SHORTCUTS = [
  "¿cómo me fue la semana?",
  "¿cuántos contratos activos tengo?",
  "solicitudes pendientes por aprobar",
  "¿cuánto facturo en B2B?",
  "mis planes B2B",
];

function ComercioAssistantPage() {
  const router = useRouter();
  const { session } = useComercioGuard(() => router.push("/comercio/login"));
  const ready = session !== null;

  const { data: profile } = useQuery({
    queryKey: ["comercio_profile"],
    queryFn: getComercioProfile,
    enabled: ready,
  });

  const { data: intro } = useQuery({
    queryKey: ["comercio_assistant_capabilities"],
    queryFn: getComercioAssistantCapabilities,
    enabled: ready,
    staleTime: Infinity,
  });

  const { data: digestEnabledServer } = useQuery({
    queryKey: ["comercio_weekly_digest"],
    queryFn: getWeeklyDigestEnabled,
    enabled: ready,
  });

  // Lo que el dueño acaba de tocar manda sobre lo que trajo el servidor, para
  // que el interruptor responda al instante.
  const [digestEnabledLocal, setDigestEnabledLocal] = useState<boolean | null>(null);
  const digestEnabled = digestEnabledLocal ?? digestEnabledServer;

  const toggleDigest = async () => {
    if (digestEnabled === undefined) return;

    const next = !digestEnabled;
    setDigestEnabledLocal(next);

    try {
      await setWeeklyDigestEnabled(next);
    } catch {
      // Si no se guardó, el interruptor vuelve a decir la verdad.
      setDigestEnabledLocal(!next);
    }
  };

  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const shortcuts = useMemo(() => {
    if (profile?.businessModel === "b2b") return B2B_SHORTCUTS;
    if (profile?.businessModel === "b2c") return B2C_SHORTCUTS;
    // Sin perfil cargado todavía, se mezcla lo más representativo de cada lado.
    // El primero de cada lista es el mismo (el resumen), así que del lado B2B
    // se toma el segundo.
    return [B2C_SHORTCUTS[0], B2C_SHORTCUTS[1], B2B_SHORTCUTS[1]];
  }, [profile?.businessModel]);

  // La pantalla arranca en blanco y la memoria del servidor también. Si falla
  // no se avisa: lo peor que pasa es que un "¿y ayer?" continúe la charla
  // anterior, y eso no justifica un error en pantalla.
  useEffect(() => {
    if (!ready) return;
    resetComercioAssistantConversation().catch(() => undefined);
  }, [ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, sending]);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || sending) return;

    setError(null);
    setInput("");
    setSending(true);

    const userId = `u-${Date.now()}`;
    setEntries((prev) => [...prev, { role: "user", id: userId, text: message }]);

    try {
      const reply = await askComercioAssistant(message);
      setEntries((prev) => [
        ...prev,
        { role: "assistant", id: `a-${Date.now()}`, reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo consultar el asistente",
      );
    } finally {
      setSending(false);
    }
  };

  /**
   * Se pinta al instante y se manda después: votar es un gesto de un segundo,
   * y una espera lo volvería trámite. Si el backend lo rechaza, el pulgar se
   * retira sin avisar: el dueño ya siguió preguntando.
   *
   * Tocar otra vez el mismo pulgar no lo quita: el backend guarda el último
   * voto y no sabe borrarlo, así que un "deshacer" mentiría. Cambiarlo sí.
   */
  const rate = async (entryId: string, usageId: string, helpful: boolean) => {
    const setHelpful = (value: boolean | undefined) =>
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId && e.role === "assistant" ? { ...e, helpful: value } : e,
        ),
      );

    const current = entries.find((e) => e.id === entryId);
    const previous = current?.role === "assistant" ? current.helpful : undefined;

    if (previous === helpful) return;

    setHelpful(helpful);

    if (!(await sendComercioAssistantFeedback(usageId, helpful))) {
      setHelpful(previous);
    }
  };

  if (!ready) {
    return <div className="p-4 text-center text-slate-300">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto flex h-[85vh] max-w-3xl flex-col rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <Link
            href="/comercio/dashboard"
            className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10"
            aria-label="Volver al panel"
          >
            <IoArrowBack />
          </Link>

          <div className="flex items-center gap-2">
            <IoSparkles className="text-cyan-400" size={20} />
            <Title as="h1" size="sm" colVariant="on" font="semi">
              Asistente del comercio
            </Title>
          </div>

          <Link
            href="/comercio/assistant/connect"
            className="ml-auto text-xs text-cyan-400 transition hover:text-cyan-300"
            title="Conecta tu catálogo al asistente que atiende a tus clientes"
          >
            Asistente para clientes
          </Link>

          {digestEnabled !== undefined ? (
            <button
              type="button"
              role="switch"
              aria-checked={digestEnabled}
              onClick={toggleDigest}
              title="Los lunes, solo si hubo movimiento en la semana"
              className="flex items-center gap-2 text-xs text-slate-400 transition hover:text-slate-200"
            >
              <span className="hidden sm:inline">Resumen semanal por correo</span>
              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  digestEnabled ? "bg-cyan-600" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    digestEnabled ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          ) : null}
        </div>

        {/* CONVERSACIÓN */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {entries.length === 0 && intro ? (
            <AssistantMessage reply={intro} />
          ) : null}

          {entries.map((entry) =>
            entry.role === "user" ? (
              <UserMessage key={entry.id} text={entry.text} />
            ) : (
              <AssistantMessage
                key={entry.id}
                reply={entry.reply}
                helpful={entry.helpful}
                onRate={
                  entry.reply.usageId
                    ? (helpful) => rate(entry.id, entry.reply.usageId!, helpful)
                    : undefined
                }
              />
            ),
          )}

          {sending ? (
            <div className="w-fit rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
              Consultando…
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {/* ATAJOS */}
        {entries.length === 0 ? (
          <div className="flex flex-wrap gap-2 px-6 pb-3">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                onClick={() => send(shortcut)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.09]"
              >
                {shortcut}
              </button>
            ))}
          </div>
        ) : null}

        {/* ENTRADA */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-white/10 px-6 py-4"
        >
          <InputField
            regexType="safeChars"
            inputSize="sm"
            rounded="lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // El backend rechaza más de 500 caracteres; se corta aquí para que
            // el usuario no escriba un mensaje que va a ser rechazado.
            maxLength={500}
            placeholder="Pregúntame por tus pedidos, ventas o contratos…"
            className="flex-1 text-white"
          />

          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-full bg-cyan-600 p-3 text-white transition hover:bg-cyan-500 disabled:opacity-40"
            aria-label="Enviar"
          >
            <IoSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * La pantalla vive detrás del plan: si el plan de acceso del comercio no la
 * incluye, se explica en lugar de dejarlo chocar con el 403 del backend.
 */
export default function ComercioAssistantPageGated() {
  return (
    <PlanFeatureGate feature="assistant">
      <ComercioAssistantPage />
    </PlanFeatureGate>
  );
}
