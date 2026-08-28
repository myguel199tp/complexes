"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Title } from "complexes-next-components";
import { IoArrowBack, IoSend, IoSparkles } from "react-icons/io5";

import { useComercioGuard } from "../_lib/comercio-auth";
import PlanFeatureGate from "../_components/plan-feature-gate";
import { getComercioProfile } from "../_lib/comercio-profile";
import {
  askComercioAssistant,
  getComercioAssistantCapabilities,
  type ComercioAssistantReply,
} from "./services/comercioAssistantService";
import { AssistantMessage, UserMessage } from "./_components/assistant-message";

type ChatEntry =
  | { role: "user"; id: string; text: string }
  | { role: "assistant"; id: string; reply: ComercioAssistantReply };

/**
 * Atajos por modelo de negocio. Un comercio B2B no vende a residentes, así que
 * ofrecerle "¿cuántos pedidos tengo?" solo lo manda a una respuesta vacía.
 */
const B2C_SHORTCUTS = [
  "¿cuántos pedidos tengo pendientes?",
  "¿cuánto vendí hoy?",
  "¿qué productos están agotados?",
  "¿quién está repartiendo?",
];

const B2B_SHORTCUTS = [
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

  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const shortcuts = useMemo(() => {
    if (profile?.businessModel === "b2b") return B2B_SHORTCUTS;
    if (profile?.businessModel === "b2c") return B2C_SHORTCUTS;
    // Sin perfil cargado todavía, se mezcla lo más representativo de cada lado.
    return [B2C_SHORTCUTS[0], B2C_SHORTCUTS[1], B2B_SHORTCUTS[0]];
  }, [profile?.businessModel]);

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
              <AssistantMessage key={entry.id} reply={entry.reply} />
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // El backend rechaza más de 500 caracteres; se corta aquí para que
            // el usuario no escriba un mensaje que va a ser rechazado.
            maxLength={500}
            placeholder="Pregúntame por tus pedidos, ventas o contratos…"
            className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
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
