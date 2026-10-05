"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar } from "complexes-next-components";
import { FiMinus, FiX } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import Chatear from "@/app/components/ui/citofonie-message/chatear";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import AssistantChat from "../my-new-user/_components/assistantChat";
import { useAssistantSection } from "../my-new-user/_components/use-assistant-section";

const DOCK_STORAGE_KEY = "panel-floating-dock-open";
const ASSISTANT_EXPANDED_KEY = "panel-assistant-expanded";

function persistAssistantExpanded(expanded: boolean) {
  try {
    window.localStorage.setItem(ASSISTANT_EXPANDED_KEY, String(expanded));
  } catch {
    /* modo incógnito o storage bloqueado: no es crítico */
  }
}

/** Otras partes del panel (p. ej. la alerta de emergencia) piden abrir a Lari. */
export const OPEN_ASSISTANT_EVENT = "smartph:open-assistant";

interface FloatingDockProps {
  /** Lari sólo tiene sentido para quien administra el conjunto. */
  showAssistant: boolean;
}

/**
 * 🧰 Dock flotante: reúne el chat de citofonía y a Lary en una sola burbuja
 * de la esquina inferior derecha. Antes vivían separados (el chat arriba a la
 * derecha, el asistente abajo) y tapaban contenido sin poder quitarse; ahora el
 * usuario puede esconder todo con un clic y volver a abrirlo cuando lo necesite.
 */
export default function FloatingDock({ showAssistant }: FloatingDockProps) {
  const userRolName = useConjuntoStore((state) => state.role);
  const showChat = userRolName !== "user";

  const [dockOpen, setDockOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  /**
   * Lary se abre a pantalla completa: la idea es manejar el panel solo con
   * instrucciones. Quien prefiera la ventanita la elige y se recuerda.
   */
  const [assistantExpanded, setAssistantExpanded] = useState(true);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  /**
   * La sección en la que está el usuario. El globito la nombra para que se
   * note que Lary sabe dónde está, sin dar a entender que solo sabe de eso.
   */
  const section = useAssistantSection(usePathname(), showAssistant);
  /** Secciones ya saludadas: el globito sale una vez por sección, no en cada clic. */
  const greetedRef = useRef(new Set<string>());
  /** Mensajes de citofonía sin leer, para avisar con el dock escondido. */
  const [unreadCount, setUnreadCount] = useState(0);

  // Recordamos la preferencia: si lo escondió, que siga escondido al navegar.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DOCK_STORAGE_KEY);
      setDockOpen(stored === null ? true : stored === "true");
    } catch {
      setDockOpen(true);
    }

    try {
      const expanded = window.localStorage.getItem(ASSISTANT_EXPANDED_KEY);
      if (expanded !== null) setAssistantExpanded(expanded === "true");
    } catch {
      /* sin storage se queda en pantalla completa */
    }
  }, []);

  const toggleAssistantExpanded = () => {
    setAssistantExpanded((prev) => {
      persistAssistantExpanded(!prev);
      return !prev;
    });
  };

  // Esc sale de la pantalla completa sin cerrar a Lary ni perder la charla.
  useEffect(() => {
    if (!assistantOpen || !assistantExpanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAssistantExpanded(false);
      persistAssistantExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [assistantOpen, assistantExpanded]);

  const toggleDock = () => {
    setDockOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(DOCK_STORAGE_KEY, String(next));
      } catch {
        /* modo incógnito o storage bloqueado: no es crítico */
      }
      if (!next) setAssistantOpen(false);
      return next;
    });
  };

  // Permite abrir a Lari desde fuera del dock sin levantar el estado al layout.
  useEffect(() => {
    const open = () => {
      setDockOpen(true);
      setAssistantOpen(true);
      setShowWelcomeTooltip(false);
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, open);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, open);
  }, []);

  // 👋 Saludo de Lari, sólo mientras el chat esté cerrado: al entrar al panel
  // y la primera vez que se llega a cada sección.
  // `undefined` mientras llega la tabla: saludar antes sería decir "hola" y,
  // un segundo después, volver a saludar ya con la sección.
  const greetingKey =
    section === undefined ? undefined : (section?.id ?? "general");
  useEffect(() => {
    if (!showAssistant || !dockOpen || assistantOpen || !greetingKey) return;
    if (greetedRef.current.has(greetingKey)) return;
    greetedRef.current.add(greetingKey);

    const show = setTimeout(() => setShowWelcomeTooltip(true), 1000);
    const hide = setTimeout(() => setShowWelcomeTooltip(false), 6000);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      // Si se cambia de sección con el globito a la vista, el temporizador que
      // lo escondía ya no corre: se quedaría pegado con la sección anterior.
      setShowWelcomeTooltip(false);
    };
  }, [showAssistant, dockOpen, assistantOpen, greetingKey]);

  if (!showChat && !showAssistant) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {/* 🤖 Panel de Lari. En el celular ocupa siempre la pantalla entera: ahí
          una ventanita flotante no le deja sitio. Desde tablet se elige entre
          pantalla completa y ventana. */}
      {dockOpen && showAssistant && assistantOpen && (
        <div
          className={
            assistantExpanded
              ? "fixed inset-0 z-10 flex h-[100dvh] w-full flex-col overflow-hidden overscroll-contain bg-slate-950"
              : "fixed inset-0 z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950 sm:static sm:h-[600px] sm:max-h-[70vh] sm:w-[380px] sm:max-w-[380px] sm:rounded-2xl sm:border sm:border-white/10 sm:bg-slate-900/90 sm:shadow-2xl sm:backdrop-blur-2xl"
          }
        >
          <AssistantChat
            onClose={() => setAssistantOpen(false)}
            expanded={assistantExpanded}
            onToggleExpanded={toggleAssistantExpanded}
          />
        </div>
      )}

      {/* 👋 Saludo de entrada */}
      {dockOpen && showAssistant && showWelcomeTooltip && !assistantOpen && (
        <div className="max-w-[260px] bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm animate-bounce">
          {section ? (
            <>
              👋 ¿Te ayudo con {section.label}?
              <span className="block text-xs text-white/70">
                También puedes preguntarme de cualquier otro tema.
              </span>
            </>
          ) : (
            "👋 Hola, ¿en qué puedo ayudarte?"
          )}
        </div>
      )}

      {/* 🧰 Dock con los accesos.
          Escondido se oculta con CSS en vez de desmontarse: el chat vive aquí
          dentro con su socket, y al desmontarlo dejaba de enterarse de los
          mensajes que llegaban, así que al volver no había nada que avisar. */}
      <div className={dockOpen ? "contents" : "hidden"}>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between gap-3 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Comunicación
            </span>
            <button
              type="button"
              onClick={toggleDock}
              aria-label="Esconder chat y asistente"
              title="Esconder"
              className="text-white/70 hover:text-white transition-colors"
            >
              <FiMinus size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {showChat && <Chatear onUnreadChange={setUnreadCount} />}

            {showAssistant && (
              <div className="relative group">
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap">
                  {section
                    ? `👋 Soy Lary: pregúntame de ${section.label} o de lo que quieras`
                    : "👋 Hola soy Lary ¿Necesitas ayuda?"}
                </div>
                <Avatar
                  src="/gcmplx.png"
                  alt="Lary"
                  size="sm"
                  border="thick"
                  shape="round"
                  className="w-12 h-12 rounded-full cursor-pointer text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200"
                  onClick={() => {
                    setAssistantOpen((prev) => !prev);
                    setShowWelcomeTooltip(false);
                  }}
                />
                {assistantOpen && (
                  <button
                    type="button"
                    onClick={() => setAssistantOpen(false)}
                    aria-label="Cerrar asistente"
                    title="Cerrar asistente"
                    className="absolute -top-2 -right-2 bg-slate-900 border border-white/20 text-white rounded-full p-1 shadow-lg hover:bg-slate-700 transition-colors"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔘 Lanzador: sólo con el dock cerrado.
          Con el dock abierto sobraba —la cabecera ya trae su "−" para
          esconderlo— y además quedaba como un círculo grande por debajo del
          panel, tapando contenido y compitiendo con él. Cerrado es lo único
          que queda en pantalla, así que va discreto: pequeño y apagado hasta
          que el puntero lo busca. */}
      {!dockOpen && (
        <>
          {/* 📩 Con mensajes sin leer el lanzador deja de ser discreto: avisa
              cuántos hay y quién escribió, porque escondido no había forma de
              enterarse de que había llegado algo. */}
          {unreadCount > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm">
              💬 Tienes {unreadCount} mensaje{unreadCount === 1 ? "" : "s"} sin
              leer
            </div>
          )}

          <button
            type="button"
            onClick={toggleDock}
            aria-label={
              unreadCount > 0
                ? `Abrir chat y asistente, ${unreadCount} mensajes sin leer`
                : "Abrir chat y asistente"
            }
            title={
              unreadCount > 0
                ? `${unreadCount} mensaje${unreadCount === 1 ? "" : "s"} sin leer`
                : "Chat y asistente"
            }
            className={`relative w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              unreadCount > 0
                ? "bg-cyan-500 text-white animate-pulse"
                : "bg-cyan-700/70 hover:bg-cyan-600 text-white/90 hover:text-white"
            }`}
          >
            <BsChatDots size={16} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
