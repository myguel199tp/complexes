"use client";

import React, { useEffect, useState } from "react";
import { Avatar } from "complexes-next-components";
import { FiMinus, FiX } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import Chatear from "@/app/components/ui/citofonie-message/chatear";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import AssistantChat from "../my-new-user/_components/assistantChat";

const DOCK_STORAGE_KEY = "panel-floating-dock-open";

/** Otras partes del panel (p. ej. la alerta de emergencia) piden abrir a Lari. */
export const OPEN_ASSISTANT_EVENT = "smartph:open-assistant";

interface FloatingDockProps {
  /** Lari sólo tiene sentido para quien administra el conjunto. */
  showAssistant: boolean;
}

/**
 * 🧰 Dock flotante: reúne el chat de citofonía y a Lari en una sola burbuja
 * de la esquina inferior derecha. Antes vivían separados (el chat arriba a la
 * derecha, el asistente abajo) y tapaban contenido sin poder quitarse; ahora el
 * usuario puede esconder todo con un clic y volver a abrirlo cuando lo necesite.
 */
export default function FloatingDock({ showAssistant }: FloatingDockProps) {
  const userRolName = useConjuntoStore((state) => state.role);
  const showChat = userRolName !== "user";

  const [dockOpen, setDockOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);

  // Recordamos la preferencia: si lo escondió, que siga escondido al navegar.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DOCK_STORAGE_KEY);
      setDockOpen(stored === null ? true : stored === "true");
    } catch {
      setDockOpen(true);
    }
  }, []);

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

  // 👋 Saludo inicial de Lari, sólo mientras el chat esté cerrado.
  useEffect(() => {
    if (!showAssistant || !dockOpen || assistantOpen) return;

    const show = setTimeout(() => setShowWelcomeTooltip(true), 1000);
    const hide = setTimeout(() => setShowWelcomeTooltip(false), 6000);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [showAssistant, dockOpen, assistantOpen]);

  if (!showChat && !showAssistant) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {/* 🤖 Panel de Lari */}
      {dockOpen && showAssistant && assistantOpen && (
        <div className="w-[calc(100vw-40px)] sm:w-[380px] max-w-[380px] h-[600px] max-h-[70vh] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <AssistantChat />
        </div>
      )}

      {/* 👋 Saludo de entrada */}
      {dockOpen && showAssistant && showWelcomeTooltip && !assistantOpen && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm animate-bounce">
          👋 Hola, ¿en qué puedo ayudarte?
        </div>
      )}

      {/* 🧰 Dock con los accesos */}
      {dockOpen && (
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
            {showChat && <Chatear />}

            {showAssistant && (
              <div className="relative group">
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap">
                  👋 Hola soy Lari ¿Necesitas ayuda?
                </div>
                <Avatar
                  src="/gcmplx.png"
                  alt="SmarPH"
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
      )}

      {/* 🔘 Lanzador: sólo con el dock cerrado.
          Con el dock abierto sobraba —la cabecera ya trae su "−" para
          esconderlo— y además quedaba como un círculo grande por debajo del
          panel, tapando contenido y compitiendo con él. Cerrado es lo único
          que queda en pantalla, así que va discreto: pequeño y apagado hasta
          que el puntero lo busca. */}
      {!dockOpen && (
        <button
          type="button"
          onClick={toggleDock}
          aria-label="Abrir chat y asistente"
          title="Chat y asistente"
          className="w-10 h-10 rounded-full bg-cyan-700/70 hover:bg-cyan-600 text-white/90 hover:text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <BsChatDots size={16} />
        </button>
      )}
    </div>
  );
}
