"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import {
  AUDIENCE_INTRO,
  AUDIENCE_LABEL,
  AUDIENCE_QUESTION,
  Audience,
  CTA_LABEL,
  FALLBACK,
  FAQS,
  GREETING,
  OPEN_EVENT,
  buildWhatsappUrl,
  detectAudience,
  matchFaq,
} from "./script";
import PricingCard from "./pricing-card";

/**
 * Burbuja de WhatsApp con un paso previo de conversación.
 *
 * Reemplaza a los enlaces `wa.me` sueltos de la portada, la demo y la landing
 * de comercios. El visitante ya no sale del sitio con un "Hola" en blanco:
 * primero dice si es conjunto o comercio, resuelve lo frecuente con respuestas
 * ya escritas (por chip o escribiendo) y, cuando pasa a WhatsApp, el asesor
 * recibe el mensaje con quién es y qué estaba preguntando.
 *
 * Sin backend ni IA: el guión vive en `script.ts`.
 */

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  /** Botón bajo la burbuja hacia la página que amplía la respuesta. */
  link?: { label: string; href: string };
  /** Widget interactivo dentro de la burbuja (hoy solo la calculadora). */
  widget?: "pricing";
}

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

export default function WhatsappAssistant() {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  /** Último tema tocado; viaja dentro del mensaje de WhatsApp. */
  const [topic, setTopic] = useState<string | undefined>(undefined);

  const endRef = useRef<HTMLDivElement | null>(null);

  const push = useCallback(
    (
      from: Message["from"],
      text: string,
      extra?: Pick<Message, "link" | "widget">
    ) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), from, text, ...extra },
      ]);
    },
    []
  );

  /** Abre el panel y siembra el saludo la primera vez. */
  const openPanel = useCallback(
    (preset?: Audience) => {
      setOpen(true);

      /* Con `preset` el CTA ya dijo con quién hablamos: se salta la pregunta
         y entra directo al guión de esa audiencia. */
      setMessages((prev) => {
        if (prev.length > 0) return prev;

        return [
          { id: nextId(), from: "bot", text: GREETING },
          {
            id: nextId(),
            from: "bot",
            text: preset ? AUDIENCE_INTRO[preset] : AUDIENCE_QUESTION,
          },
        ];
      });

      if (preset) setAudience(preset);
    },
    [setOpen]
  );

  /* Cualquier CTA de la página puede abrir el asistente lanzando el evento. */
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ audience?: Audience }>).detail;
      openPanel(detail?.audience);
    };

    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  const chooseAudience = (value: Audience) => {
    setAudience(value);
    setTopic(undefined);
    push("user", AUDIENCE_LABEL[value]);
    push("bot", AUDIENCE_INTRO[value]);
  };

  const answer = (faqId: string, value: Audience) => {
    const faq = FAQS[value].find((item) => item.id === faqId);
    if (!faq) return;

    setTopic(faq.pregunta);
    push("user", faq.pregunta);
    push("bot", faq.respuesta, { link: faq.link, widget: faq.widget });
  };

  /** Texto libre: primero deduce con quién habla, después busca la respuesta. */
  const send = () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    push("user", text);
    setTopic(text);

    if (!audience) {
      const guessed = detectAudience(text);

      if (!guessed) {
        push("bot", AUDIENCE_QUESTION);
        return;
      }

      setAudience(guessed);
      push("bot", AUDIENCE_INTRO[guessed]);

      const faq = matchFaq(text, guessed);
      if (faq) push("bot", faq.respuesta, { link: faq.link, widget: faq.widget });
      return;
    }

    const faq = matchFaq(text, audience);

    if (!faq) {
      push("bot", FALLBACK);
      return;
    }

    push("bot", faq.respuesta, { link: faq.link, widget: faq.widget });
  };

  /* Mientras no sepamos con quién hablamos, los chips son las dos audiencias. */
  const pendingFaqs = audience
    ? FAQS[audience].filter((faq) => faq.pregunta !== topic)
    : [];

  return (
    <>
      {open && (
        <div
          className="
            fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col overflow-hidden
            rounded-t-2xl border border-gray-200 bg-white shadow-2xl
            sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[540px] sm:w-[380px] sm:rounded-2xl
          "
          role="dialog"
          aria-label="Asistente de globaliaph"
        >
          {/* CABECERA */}
          <div className="flex items-center gap-3 bg-green-600 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <FaWhatsapp size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                Asistente globaliaph
              </p>
              <p className="truncate text-xs text-white/80">
                Respuestas al instante · asesor si lo necesitas
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* CONVERSACIÓN */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                    /* La calculadora necesita el ancho completo de la burbuja. */
                    message.widget ? "w-full" : "max-w-[85%]"
                  } ${
                    message.from === "user"
                      ? "rounded-br-sm bg-green-600 text-white"
                      : "rounded-bl-sm bg-white text-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>

                  {message.link && (
                    <Link
                      href={message.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 rounded-md border border-cyan-600 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
                    >
                      {message.link.label} →
                    </Link>
                  )}

                  {message.widget === "pricing" && (
                    <PricingCard onQuoted={setTopic} />
                  )}
                </div>
              </div>
            ))}

            <div ref={endRef} />
          </div>

          {/* OPCIONES RÁPIDAS */}
          <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-white px-4 pt-3">
            {!audience &&
              (Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseAudience(value)}
                  className="rounded-full border border-cyan-600 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50"
                >
                  {AUDIENCE_LABEL[value]}
                </button>
              ))}

            {audience &&
              pendingFaqs.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => answer(faq.id, audience)}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-cyan-600 hover:text-cyan-700"
                >
                  {faq.pregunta}
                </button>
              ))}
          </div>

          {/* ESCRIBIR + SALIDA A WHATSAPP */}
          <div className="space-y-2 bg-white px-4 pb-4 pt-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta…"
                aria-label="Escribe tu pregunta"
                className="h-10 w-full rounded-full border border-gray-300 px-4 text-sm outline-none focus:border-cyan-600"
              />

              <button
                type="submit"
                aria-label="Enviar pregunta"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:opacity-40"
                disabled={!input.trim()}
              >
                <IoSend size={16} />
              </button>
            </form>

            <a
              href={buildWhatsappUrl(audience, topic)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-green-600 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <FaWhatsapp size={18} />
              {CTA_LABEL}
            </a>
          </div>
        </div>
      )}

      {/* BURBUJA FLOTANTE */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={
          open
            ? "Cerrar asistente"
            : "Hablar con el asistente o con un asesor por WhatsApp"
        }
        aria-expanded={open}
        className="
          fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full
          bg-green-500 px-4 py-3 text-white shadow-lg transition-all
          hover:scale-105 hover:bg-green-600 active:scale-95
          sm:bottom-6 sm:right-6
        "
      >
        <span className="relative flex items-center justify-center">
          {open ? <IoClose size={22} /> : <FaWhatsapp size={22} />}
          {!open && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-white/80" />
          )}
        </span>

        {/* Arriba, la pregunta que engancha —el visitante se reconoce en una de
            las dos—; abajo, lo que hay detrás del botón: el asistente responde
            al instante y el asesor queda a un clic. */}
        {!open && (
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="whitespace-nowrap text-sm font-semibold">
              ¿Conjunto o comercio?
            </span>
            <span className="whitespace-nowrap text-[11px] opacity-90">
              Habla con el asistente o un asesor
            </span>
          </span>
        )}
      </button>
    </>
  );
}
