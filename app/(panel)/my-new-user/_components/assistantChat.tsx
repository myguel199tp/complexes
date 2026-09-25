"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  AiAssistantService,
  type AssistantMode,
  type AssistantModes,
  type AssistantBriefing,
  type BriefingItem,
  type BriefingSeverity,
  type QuickSuggestion,
} from "../services/aiAssistantService";
import { dismissB2bDemandSuggestion } from "@/app/(panel)/my-b2b/services/b2bDemandService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import AssistantOrb, { OrbState } from "./assistant-orb";
import LaryAvatar from "./lary-avatar";
import TypedText from "./typed-text";
import { useMicLevel } from "./use-mic-level";
import { speak, stopSpeaking, stripMarkdown } from "./assistant-speech";
import { Text } from "complexes-next-components";

const aiService = new AiAssistantService();

/** Preferencia de voz. Se recuerda: reactivarla en cada visita era un fastidio. */
const VOICE_STORAGE_KEY = "assistant.voice";

/**
 * Motor elegido. Se recuerda igual que la voz, pero nunca manda por sí solo: el
 * backend contrasta la preferencia con el plan del conjunto en cada consulta.
 */
const MODE_STORAGE_KEY = "assistant.mode";

/**
 * Vista elegida: Lary en grande hablando, o la conversación escrita. Se
 * recuerda; sin preferencia guardada el celular arranca con Lary, porque en
 * una pantalla pequeña escucharla es más cómodo que leer un hilo de burbujas.
 */
const VIEW_STORAGE_KEY = "assistant.view";

type AssistantView = "avatar" | "chat";

const MODE_BLOCKED_REASON: Record<string, string> = {
  plan: "El modo IA está disponible en los planes Gold y Platinum",
  not_configured: "El modo IA todavía no está configurado en este servidor",
};

/**
 * Frases con las que el usuario pide explícitamente una tabla. El backend
 * necesita saber el formato antes de resolver, y hasta que el motor lo decida
 * por su cuenta esto evita tener que elegirlo a mano en un desplegable.
 */
const TABLE_HINT = /\b(tabla|tablas|listado|columnas|en filas)\b/i;

/**
 * Los atajos ya no están escritos aquí: los manda el backend filtrados por el
 * rol del usuario. Estaban fijos y eran los mismos para todos, así que a un
 * propietario se le ofrecía "¿quién no ha pagado este mes?" —información de sus
 * vecinos, que además el backend le habría negado—. Un atajo que lleva a un
 * "no tienes permisos" es peor que no ofrecer ninguno.
 */

type AssistantMessage = {
  id: string;
  from: "user" | "assistant";
  text: string;
  type?: "text" | "table";
  data?: Record<string, unknown>[];
  /** Solo el mensaje recién llegado se escribe con efecto máquina. */
  animate?: boolean;
  error?: boolean;
  /**
   * Identifica esta respuesta en el backend. Sin él no hay nada que calificar,
   * y los pulgares no se pintan.
   */
  usageId?: string;
  /**
   * Lo que votó el usuario, si votó. `undefined` es "no ha votado", que no es
   * lo mismo que un voto negativo: la mayoría de las respuestas no se califican
   * y tratarlas como malas sería convertir el silencio en queja.
   */
  helpful?: boolean;
};

// ── Iconos ───────────────────────────────────────────────────────────────────

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm6.5 9a.5.5 0 0 1 .5.5A7 7 0 0 1 12.5 17v2.5H15a.5.5 0 0 1 0 1H9a.5.5 0 0 1 0-1h2.5V17A7 7 0 0 1 5 10.5a.5.5 0 0 1 1 0A6 6 0 0 0 18 10.5a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
      <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
    </svg>
  );
}

function IconThumbUp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.499 4.499 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.977a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
    </svg>
  );
}

function IconThumbDown() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M16.507 5.5c.425 0 .82.236.975.632.335.855.518 1.786.518 2.743 0 1.75-.599 3.358-1.602 4.634-.151.192-.373.309-.6.397-.473.183-.89.514-1.212.924a9.042 9.042 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v1.633a.75.75 0 0 1-.75.75 2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A11.95 11.95 0 0 1 1.5 12.75c0-2.836.985-5.44 2.649-7.521.388-.482.987-.729 1.605-.729H9.77c.483 0 .964.078 1.423.23l3.114 1.04c.46.152.94.23 1.423.23h.777Zm5.162 7.523a11.969 11.969 0 0 0 .831-4.398 12 12 0 0 0-.52-3.507C21.72 4.518 20.895 4 20.006 4H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.052c.832 0 1.612-.453 1.918-1.227Z" />
    </svg>
  );
}

function IconVoiceOn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M13 3.5v17a1 1 0 0 1-1.6.8L6.7 17.5H4a1.5 1.5 0 0 1-1.5-1.5v-4A1.5 1.5 0 0 1 4 10.5h2.7l4.7-3.8A1 1 0 0 1 13 3.5Zm4.2 2.6a.75.75 0 0 1 1.06 0 8.4 8.4 0 0 1 0 11.8.75.75 0 1 1-1.06-1.06 6.9 6.9 0 0 0 0-9.68.75.75 0 0 1 0-1.06Zm-2.5 2.7a.75.75 0 0 1 1.06 0 4.6 4.6 0 0 1 0 6.4.75.75 0 1 1-1.06-1.06 3.1 3.1 0 0 0 0-4.28.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconVoiceOff() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M13 3.5v17a1 1 0 0 1-1.6.8L6.7 17.5H4a1.5 1.5 0 0 1-1.5-1.5v-4A1.5 1.5 0 0 1 4 10.5h2.7l4.7-3.8A1 1 0 0 1 13 3.5Zm3.47 5.03a.75.75 0 0 1 1.06 0L19 9.94l1.47-1.47a.75.75 0 1 1 1.06 1.06L20.06 11l1.47 1.47a.75.75 0 1 1-1.06 1.06L19 12.06l-1.47 1.47a.75.75 0 0 1-1.06-1.06L17.94 11l-1.47-1.47a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.5c.3 0 .57.19.68.47l1.42 3.7a4 4 0 0 0 2.28 2.28l3.7 1.42a.73.73 0 0 1 0 1.36l-3.7 1.42a4 4 0 0 0-2.28 2.28l-1.42 3.7a.73.73 0 0 1-1.36 0l-1.42-3.7a4 4 0 0 0-2.28-2.28l-3.7-1.42a.73.73 0 0 1 0-1.36l3.7-1.42a4 4 0 0 0 2.28-2.28l1.42-3.7A.73.73 0 0 1 12 2.5ZM19 3a.5.5 0 0 1 .47.33l.4 1.1a1 1 0 0 0 .6.6l1.1.4a.5.5 0 0 1 0 .94l-1.1.4a1 1 0 0 0-.6.6l-.4 1.1a.5.5 0 0 1-.94 0l-.4-1.1a1 1 0 0 0-.6-.6l-1.1-.4a.5.5 0 0 1 0-.94l1.1-.4a1 1 0 0 0 .6-.6l.4-1.1A.5.5 0 0 1 19 3Z" />
    </svg>
  );
}

function IconChatBubbles() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
      <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 1 0 1.06 1.06L12 13.06l5.72 5.72a.75.75 0 1 0 1.06-1.06L13.06 12l5.72-5.72a.75.75 0 0 0-1.06-1.06L12 10.94 6.28 5.22Z" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25V8H3V5.25ZM3 9.5h6.25v5H3v-5Zm7.75 0H21v5H10.75v-5ZM3 16h6.25v2.75A2.25 2.25 0 0 1 7 21H5.25A2.25 2.25 0 0 1 3 18.75V16Zm7.75 0H21v2.75A2.25 2.25 0 0 1 18.75 21H10.75v-5Z" />
    </svg>
  );
}

// ── Informe de entrada ───────────────────────────────────────────────────────

/**
 * El color lo decide la gravedad y no el módulo: lo que el usuario necesita
 * distinguir de un vistazo es qué exige acción hoy, no si viene de cartera o de
 * mantenimiento.
 */
const BRIEFING_TONE: Record<BriefingSeverity, string> = {
  critical: "border-red-500/30 bg-red-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-cyan-500/25 bg-cyan-500/[0.07]",
  good: "border-emerald-500/25 bg-emerald-500/[0.07]",
};

function BriefingCard({
  item,
  onAct,
  onDismiss,
}: {
  item: BriefingItem;
  onAct: (phrase: string) => void;
  /** Solo llega en los puntos que traen `dismiss`. */
  onDismiss: (item: BriefingItem) => void;
}) {
  return (
    <div
      className={`max-w-[92%] rounded-2xl border px-3.5 py-3 sm:max-w-[80%] ${BRIEFING_TONE[item.severity]}`}
    >
      <div className="flex gap-2.5">
        <span aria-hidden="true" className="text-base leading-none">
          {item.icon}
        </span>

        <div className="min-w-0 flex-1">
          <Text size="sm" font="semi" className="text-slate-100">
            {item.title}
          </Text>

          <Text
            size="sm"
            className="mt-1 text-xs leading-relaxed text-slate-300"
          >
            {item.detail}
          </Text>

          {item.action || item.dismiss ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.action ? (
                <button
                  type="button"
                  onClick={() => onAct(item.action!.phrase)}
                  className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/20"
                >
                  {item.action.label}
                </button>
              ) : null}

              {item.dismiss ? (
                <button
                  type="button"
                  onClick={() => onDismiss(item)}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                >
                  {item.dismiss.label}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Componente ───────────────────────────────────────────────────────────────

interface AssistantChatProps {
  /**
   * Cierra el panel desde dentro. En el celular el panel ocupa la pantalla
   * entera y tapa el botón del dock que lo abrió, así que necesita el suyo.
   */
  onClose?: () => void;
}

export default function AssistantChat({ onClose }: AssistantChatProps = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      from: "assistant",
      text: "Hola soy lari,. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const [input, setInput] = useState("");
  /** Transcripción provisional del micrófono, aún no confirmada. */
  const [interim, setInterim] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  /** Texto que va llegando por tokens, si el backend los emite. */
  const [live, setLive] = useState<string | null>(null);

  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [tableMode, setTableMode] = useState(false);
  const [view, setView] = useState<AssistantView>("chat");
  /** El saludo definitivo (el informe o el genérico) ya está puesto. */
  const [ready, setReady] = useState(false);
  const greetedRef = useRef(false);

  /**
   * Arranca en `rules` a propósito. Es el motor que no cuesta nada: si la
   * consulta de disponibilidad tarda o falla, el usuario nunca acaba gastando
   * tokens sin haberlo pedido.
   */
  const [mode, setMode] = useState<AssistantMode>("rules");
  const [modes, setModes] = useState<AssistantModes | null>(null);
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
  const [briefing, setBriefing] = useState<AssistantBriefing | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const micLevel = useMicLevel(listening);

  const orbState: OrbState = listening
    ? "listening"
    : thinking
      ? "thinking"
      : speaking
        ? "speaking"
        : "idle";

  // ── Preferencia de voz ────────────────────────────────────────────────────

  useEffect(() => {
    const stored = window.localStorage.getItem(VOICE_STORAGE_KEY);
    if (stored !== null) setVoiceEnabled(stored === "true");
  }, []);

  // ── Vista ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);

    if (stored === "avatar" || stored === "chat") {
      setView(stored);
      return;
    }

    if (window.matchMedia("(max-width: 639px)").matches) setView("avatar");
  }, []);

  const toggleView = () => {
    setView((current) => {
      const next: AssistantView = current === "avatar" ? "chat" : "avatar";
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
      return next;
    });
  };

  const toggleVoice = () => {
    setVoiceEnabled((enabled) => {
      const next = !enabled;
      window.localStorage.setItem(VOICE_STORAGE_KEY, String(next));

      if (!next) {
        stopSpeaking();
        setSpeaking(false);
      }

      return next;
    });
  };

  // ── Disponibilidad del modo IA ────────────────────────────────────────────

  useEffect(() => {
    if (!conjuntoId) return;

    let cancelled = false;

    // La pantalla arranca en blanco, así que el hilo que el asistente recuerda
    // en el servidor tiene que arrancar en blanco también: si no, el usuario ve
    // un chat vacío y recibe respuestas apoyadas en lo que preguntó antes de
    // cerrar el panel.
    //
    // Va en paralelo con el bootstrap y no antes para no retrasar la apertura:
    // el borrado toca solo la caché y el bootstrap consulta media docena de
    // módulos, así que llega mucho antes. Y hasta que el bootstrap no pinta los
    // atajos, el usuario no tiene nada que pulsar.
    void aiService.resetConversation(String(conjuntoId));

    aiService
      .getBootstrap(String(conjuntoId))
      .then(({ modes: available, suggestions: offered, briefing: report }) => {
        if (cancelled) return;

        setModes(available);
        setSuggestions(offered);

        // El saludo genérico se reemplaza por el informe: es el mismo primer
        // mensaje, pero diciendo qué hay pendiente en vez de preguntarlo.
        if (report) {
          setBriefing(report);
          setMessages([
            {
              id: "welcome",
              from: "assistant",
              text: `${report.greeting}. ${report.headline}`,
            },
          ]);
        }

        // La preferencia guardada solo se aplica si el plan la respalda: un
        // conjunto que bajó de plan tenía "ai" en su navegador y cada consulta
        // habría salido rechazada sin que él entendiera por qué.
        if (available.aiAvailable) {
          const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
          if (stored === "ai") setMode("ai");
        } else {
          setMode("rules");
        }
      })
      .catch(() => {
        // Sin respuesta se asume el motor gratuito y el interruptor queda
        // bloqueado: es el fallo que no le cuesta dinero a nadie.
        if (!cancelled) setModes({ mode: "rules", aiAvailable: false });
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [conjuntoId]);

  const toggleMode = () => {
    if (!modes?.aiAvailable) return;

    setMode((current) => {
      const next: AssistantMode = current === "ai" ? "rules" : "ai";
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
      return next;
    });
  };

  // En la vista de Lary ella misma dice el saludo: es lo que hace que se sienta
  // una persona que te recibe y no una caja de texto esperando. Una sola vez,
  // y solo si la voz está activa.
  useEffect(() => {
    if (!ready || view !== "avatar" || !voiceEnabled || greetedRef.current) {
      return;
    }

    greetedRef.current = true;
    speak(messages[0].text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    // Solo interesa el momento en que se cumplen las condiciones, no cada
    // cambio posterior del hilo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, view, voiceEnabled]);

  // Si el panel se cierra con Lary a media frase, que se calle con él.
  useEffect(() => () => stopSpeaking(), []);

  // ── Scroll ────────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, live, scrollToBottom]);

  // ── Reconocimiento de voz ─────────────────────────────────────────────────

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    // Antes estaba en false y no se veía nada hasta terminar de hablar: durante
    // toda la frase no había forma de saber si el micrófono estaba entendiendo.
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognition.onerror = () => {
      setListening(false);
      setInterim("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let confirmed = "";
      let provisional = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];

        if (result.isFinal) confirmed += result[0].transcript;
        else provisional += result[0].transcript;
      }

      if (confirmed) {
        setInput((current) =>
          current ? `${current} ${confirmed}` : confirmed,
        );
        setInterim("");
      } else {
        setInterim(provisional);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          from: "assistant",
          text: "Tu navegador no soporta el dictado por voz. Puedes escribir tu pregunta.",
          error: true,
        },
      ]);
      return;
    }

    if (listening) {
      recognition.stop();
      return;
    }

    // Hablarle mientras él habla es lo peor de los dos mundos.
    stopSpeaking();
    setSpeaking(false);

    try {
      recognition.start();
    } catch {
      // start() lanza si ya estaba activo; onend corrige el estado solo.
    }
  };

  // ── Copiar tabla ──────────────────────────────────────────────────────────

  const copyTable = (data: Record<string, unknown>[]) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => String(row[header] ?? "")).join("\t"),
    );

    navigator.clipboard.writeText([headers.join("\t"), ...rows].join("\n"));
  };

  /**
   * El pulgar arriba o abajo de una respuesta.
   *
   * Se pinta al instante y se manda después: calificar es un gesto de un
   * segundo y una espera lo convertiría en un trámite, que es la forma más
   * segura de quedarse sin datos. Si el backend lo rechaza, el pulgar se
   * retira; no se avisa con un error porque el usuario ya siguió conversando y
   * lo que se perdió es nuestro, no suyo.
   *
   * Volver a tocar el mismo pulgar no lo quita: el backend guarda el último
   * voto y no tiene forma de borrarlo, así que un "deshacer" aquí mentiría. Lo
   * que sí se puede es cambiarlo tocando el otro.
   */
  const rate = async (message: AssistantMessage, helpful: boolean) => {
    if (!message.usageId || !conjuntoId || message.helpful === helpful) return;

    const previous = message.helpful;

    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, helpful } : m)),
    );

    const saved = await aiService.sendFeedback(
      message.usageId,
      String(conjuntoId),
      helpful,
    );

    if (!saved) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, helpful: previous } : m,
        ),
      );
    }
  };

  // ── Envío ─────────────────────────────────────────────────────────────────

  /**
   * "No me interesa" en un punto del informe.
   *
   * Se quita de la vista al instante y sin esperar al backend: el usuario ya
   * dijo que no le interesa, y dejarle la tarjeta puesta mientras viaja la
   * petición es exactamente lo que quería quitarse de encima. Si la llamada
   * falla, lo que se pierde es la persistencia —vuelve a aparecer mañana—, no
   * la acción de hoy; por eso el error no se le muestra.
   */
  const dismissBriefingItem = async (item: BriefingItem) => {
    if (!item.dismiss || !conjuntoId) return;

    const { kind, id } = item.dismiss;

    setBriefing((current) =>
      current
        ? { ...current, items: current.items.filter((i) => i.key !== item.key) }
        : current,
    );

    try {
      if (kind === "b2b-demand") {
        await dismissB2bDemandSuggestion(String(conjuntoId), id);
      }
    } catch (error) {
      console.error("No se pudo descartar el punto del informe", error);
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;

    // Una pregunta nueva invalida la anterior: si el usuario cambia de tema, la
    // respuesta vieja no debe aterrizar encima de la nueva.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    stopSpeaking();
    setSpeaking(false);

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: "user", text },
    ]);

    setInput("");
    setInterim("");
    setLive(null);
    setStatus(null);
    setThinking(true);

    const format = tableMode || TABLE_HINT.test(text) ? "table" : "text";

    let streamed = "";

    await aiService.streamMessage(
      { message: text, conjuntoId: String(conjuntoId), format, mode },
      {
        onStatus: setStatus,

        onToken: (chunk) => {
          streamed += chunk;
          setLive(streamed);
        },

        onDone: (reply) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              from: "assistant",
              type: reply.type,
              text: reply.text,
              data: reply.data,
              usageId: reply.usageId,
              // Si ya se fue escribiendo por tokens, repetir el efecto sobre el
              // texto completo lo escribiría dos veces.
              animate: streamed.length === 0,
            },
          ]);

          setLive(null);

          if (voiceEnabled) {
            speak(reply.text, {
              onStart: () => setSpeaking(true),
              onEnd: () => setSpeaking(false),
            });
          }
        },

        onError: (message) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `e-${Date.now()}`,
              from: "assistant",
              text:
                message === "SESSION_EXPIRED"
                  ? "Tu sesión expiró. Vuelve a iniciar sesión para seguir."
                  : message,
              error: true,
            },
          ]);

          setLive(null);
        },
      },
      controller.signal,
    );

    setThinking(false);
    setStatus(null);
    inputRef.current?.focus();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const showSuggestions =
    messages.length === 1 && !thinking && suggestions.length > 0;

  /**
   * El informe solo acompaña al saludo: en cuanto la conversación arranca
   * estorbaría, y sus cifras además envejecen mientras el chat sigue abierto.
   */
  const showBriefing =
    messages.length === 1 && !thinking && !!briefing?.items.length;

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.from === "assistant");
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.from === "user");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {/* Resplandor de ambiente que sigue el estado del orbe. Decorativo, de
          ahí el pointer-events-none: no debe robar clics al contenido. */}
      <div
        className={`pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700 ${
          orbState === "listening"
            ? "bg-cyan-500/20"
            : orbState === "thinking"
              ? "bg-purple-500/20"
              : "bg-indigo-500/10"
        }`}
      />

      {/* HEADER */}
      <div className="relative flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
        {view === "chat" ? (
          <LaryAvatar state={orbState} level={micLevel} size={40} />
        ) : null}

        <div className="min-w-0">
          <Text size="sm" font="semi" colVariant="on" className="leading-tight">
            Soy Lary
          </Text>
          <Text
            size="sm"
            className={`text-xs leading-tight transition-colors ${
              orbState === "idle" ? "text-emerald-400" : "text-cyan-300"
            }`}
          >
            {listening
              ? "Escuchando…"
              : thinking
                ? (status ?? "Procesando…")
                : speaking
                  ? "Hablando"
                  : mode === "ai"
                    ? "En línea · IA"
                    : "En línea · Básico"}
          </Text>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleView}
            title={view === "avatar" ? "Ver como chat" : "Ver a Lary"}
            aria-label={view === "avatar" ? "Ver como chat" : "Ver a Lary"}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10"
          >
            {view === "avatar" ? <IconChatBubbles /> : <IconPerson />}
          </button>

          {/* Interruptor de motor. Se muestra siempre, incluso bloqueado: si se
              ocultara, quien no lo tiene nunca sabría que existe. */}
          <button
            type="button"
            onClick={toggleMode}
            disabled={!modes?.aiAvailable}
            title={
              modes?.aiAvailable
                ? mode === "ai"
                  ? "Modo IA activo · entiende cualquier pregunta y consume tokens"
                  : "Modo básico · sin costo, entiende frases conocidas"
                : (MODE_BLOCKED_REASON[modes?.reason ?? ""] ??
                  "El modo IA no está disponible")
            }
            aria-pressed={mode === "ai"}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              !modes?.aiAvailable
                ? "cursor-not-allowed text-slate-600"
                : mode === "ai"
                  ? "bg-purple-500/25 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                  : "text-slate-400 hover:bg-white/10"
            }`}
          >
            <IconSpark />
          </button>

          <button
            type="button"
            onClick={() => setTableMode((mode) => !mode)}
            title={
              tableMode
                ? "Responder en texto"
                : "Responder en tabla cuando se pueda"
            }
            aria-pressed={tableMode}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              tableMode
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:bg-white/10"
            }`}
          >
            <IconTable />
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            title={voiceEnabled ? "Silenciar la voz" : "Activar la voz"}
            aria-pressed={voiceEnabled}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              voiceEnabled
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:bg-white/10"
            }`}
          >
            {voiceEnabled ? <IconVoiceOn /> : <IconVoiceOff />}
          </button>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              title="Cerrar asistente"
              aria-label="Cerrar asistente"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 sm:hidden"
            >
              <IconClose />
            </button>
          ) : null}
        </div>
      </div>

      {view === "avatar" ? (
        /* LARY EN PERSONA: ella dice la respuesta y aquí queda como subtítulo.
           La conversación completa sigue en la vista de chat. */
        <div
          className="relative flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4 pt-6"
          aria-live="polite"
          aria-atomic="false"
        >
          <LaryAvatar state={orbState} level={micLevel} size={220} />

          {lastUserMessage ? (
            <p className="mt-5 line-clamp-2 max-w-full text-center text-xs text-slate-400">
              Tú: {lastUserMessage.text}
            </p>
          ) : null}

          <div
            className={`mt-3 w-full rounded-2xl border px-4 py-3 text-center text-[15px] leading-relaxed ${
              lastAssistantMessage?.error && !thinking
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-white/10 bg-white/[0.05] text-slate-100"
            }`}
          >
            {live ? (
              <TypedText text={stripMarkdown(live)} animate={false} />
            ) : thinking ? (
              <span className="text-cyan-300/90">{status ?? "Pensando…"}</span>
            ) : lastAssistantMessage ? (
              <TypedText
                key={lastAssistantMessage.id}
                text={stripMarkdown(lastAssistantMessage.text)}
                animate={!!lastAssistantMessage.animate}
              />
            ) : null}

            {/* Una tabla no se puede decir en voz alta ni cabe en un
                subtítulo: se lleva al chat, donde se puede leer y copiar. */}
            {!thinking &&
            !live &&
            lastAssistantMessage?.type === "table" &&
            lastAssistantMessage.data?.length ? (
              <button
                type="button"
                onClick={() => setView("chat")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/20"
              >
                <IconTable />
                Ver la tabla en el chat
              </button>
            ) : null}
          </div>

          {showBriefing ? (
            <div className="mt-3 flex w-full flex-col items-center space-y-2">
              {briefing?.items.map((item) => (
                <BriefingCard
                  key={item.key}
                  item={item}
                  onAct={send}
                  onDismiss={dismissBriefingItem}
                />
              ))}
            </div>
          ) : null}

          {showSuggestions ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.phrase}
                  type="button"
                  onClick={() => send(suggestion.phrase)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.09]"
                >
                  <span aria-hidden="true">{suggestion.icon}</span>
                  {suggestion.phrase}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <>
      {/* CONVERSACIÓN */}
      <div
        ref={scrollRef}
        className="relative flex-1 space-y-4 overflow-y-auto px-3 py-4"
        // El chat se actualiza sin que el usuario lo provoque; sin esto, quien
        // usa lector de pantalla no se entera de que llegó la respuesta.
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-2 ${
              message.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.from === "assistant" ? (
              <AssistantOrb state="idle" size={28} />
            ) : null}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[72%] ${
                message.from === "user"
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : message.error
                    ? "rounded-bl-sm border border-red-500/30 bg-red-500/10 text-red-200"
                    : "rounded-bl-sm border border-white/10 bg-white/[0.05] text-slate-100 backdrop-blur-sm"
              }`}
            >
              {message.from === "assistant" ? (
                <TypedText
                  text={stripMarkdown(message.text)}
                  animate={!!message.animate}
                  onReveal={scrollToBottom}
                />
              ) : (
                <Text size="sm" className="whitespace-pre-wrap break-words">
                  {message.text}
                </Text>
              )}

              {message.type === "table" && message.data?.length ? (
                <div className="mt-3 w-full overflow-x-auto">
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => copyTable(message.data ?? [])}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/20"
                    >
                      <IconCopy />
                      Copiar tabla
                    </button>
                  </div>

                  <table className="min-w-max border-collapse text-xs">
                    <thead>
                      <tr>
                        {Object.keys(message.data[0]).map((key) => (
                          <th
                            key={key}
                            className="whitespace-nowrap border border-white/10 bg-white/[0.07] px-3 py-2 text-left font-medium text-slate-200"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {message.data.map((row, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "" : "bg-white/[0.03]"}
                        >
                          {Object.values(row).map((value, cell) => (
                            <td
                              key={cell}
                              className="whitespace-nowrap border border-white/10 px-3 py-2 text-slate-300"
                            >
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/*
                Los pulgares solo aparecen si el backend registró la respuesta.
                No salen bajo el "no entendí" —esa ya se anota sola como fallo—
                ni bajo los errores de red, que no son culpa del asistente.
              */}
              {message.from === "assistant" && message.usageId ? (
                <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={() => rate(message, true)}
                    aria-pressed={message.helpful === true}
                    aria-label="Esta respuesta me sirvió"
                    title="Me sirvió"
                    className={`rounded-lg p-1.5 transition ${
                      message.helpful === true
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
                    }`}
                  >
                    <IconThumbUp />
                  </button>

                  <button
                    type="button"
                    onClick={() => rate(message, false)}
                    aria-pressed={message.helpful === false}
                    aria-label="Esta respuesta no me sirvió"
                    title="No me sirvió"
                    className={`rounded-lg p-1.5 transition ${
                      message.helpful === false
                        ? "bg-red-500/20 text-red-300"
                        : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
                    }`}
                  >
                    <IconThumbDown />
                  </button>

                  {message.helpful !== undefined ? (
                    <span className="ml-1 text-[11px] text-slate-500">
                      Gracias, lo tendremos en cuenta
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}

        {/* INFORME DE ENTRADA */}
        {showBriefing ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="ml-[36px] space-y-2"
          >
            {briefing?.items.map((item) => (
              <BriefingCard
                key={item.key}
                item={item}
                onAct={send}
                onDismiss={dismissBriefingItem}
              />
            ))}
          </motion.div>
        ) : null}

        {/* Texto llegando por tokens, mientras llega */}
        {live ? (
          <div className="flex justify-start gap-2">
            <AssistantOrb state="thinking" size={28} />
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-slate-100 sm:max-w-[72%]">
              <TypedText text={stripMarkdown(live)} animate={false} />
            </div>
          </div>
        ) : null}

        {/* Fase actual: sustituye a los tres puntos mudos de antes */}
        <AnimatePresence>
          {thinking && !live ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <AssistantOrb state="thinking" size={28} />

              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-3">
                <span className="text-xs text-cyan-300/90">
                  {status ?? "Procesando"}
                </span>

                <span className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/70"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ATAJOS */}
      {showSuggestions ? (
        <div className="flex shrink-0 flex-wrap gap-2 px-3 pb-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.phrase}
              type="button"
              onClick={() => send(suggestion.phrase)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.09]"
            >
              <span aria-hidden="true">{suggestion.icon}</span>
              {suggestion.phrase}
            </button>
          ))}
        </div>
      ) : null}
        </>
      )}

      {/* ENTRADA */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="relative flex shrink-0 items-center gap-2 border-t border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl"
      >
        <div className="relative flex-1">
          {/* Sigue siendo <input> nativo: InputField está tipado como
              FC<FieldProps> y no expone `ref`, que aquí hace falta para el
              foco y para pintar la transcripción encima. */}
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={500}
            placeholder={listening ? "Te escucho…" : "Escribe tu pregunta…"}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-500/50 focus:outline-none"
          />

          {/* La transcripción provisional se pinta encima del input: es lo que
              el micrófono cree oír y todavía puede corregir antes de fijarlo. */}
          {interim ? (
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center truncate pr-4 text-sm text-slate-500">
              {input ? `${input} ` : ""}
              <em className="not-italic text-cyan-400/60">{interim}</em>
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={toggleListening}
          title={listening ? "Detener el dictado" : "Dictar por voz"}
          aria-pressed={listening}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
            listening
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/40"
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
        >
          <IconMic />
        </button>

        <button
          type="submit"
          disabled={thinking || !input.trim()}
          title="Enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconSend />
        </button>
      </form>
    </div>
  );
}
