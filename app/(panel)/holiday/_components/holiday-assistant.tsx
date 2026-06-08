"use client";

import { useEffect, useRef, useState } from "react";
import { AiAssistantService } from "@/app/(panel)/my-new-user/services/aiAssistantService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const aiService = new AiAssistantService();

type Message = {
  from: "user" | "assistant";
  text: string;
};

const QUICK_SUGGESTIONS = [
  { label: "🐾 ¿Aceptan mascotas?", text: "¿Aceptan mascotas en el alojamiento?" },
  { label: "💰 Presupuesto < $200", text: "Mi presupuesto es menor a 200 dólares por noche" },
  { label: "🚗 ¿Tienen parqueo?", text: "¿El alojamiento tiene parqueo disponible?" },
  { label: "🎉 ¿Permiten eventos?", text: "¿Se permiten eventos o fiestas en el alojamiento?" },
  { label: "🚭 ¿Se puede fumar?", text: "¿Está permitido fumar en el alojamiento?" },
  { label: "👨‍👩‍👧 ¿Cuántos huéspedes?", text: "¿Cuál es la capacidad máxima de huéspedes?" },
];

export default function HolidayAssistant() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "assistant",
      text: "¡Hola! Soy tu asistente de Holiday 🏖️. Puedo ayudarte con preguntas sobre alojamientos: presupuesto, mascotas, parqueo, capacidad y más. ¿En qué te ayudo?",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? message).trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        `Contexto: el usuario está buscando alojamientos en la sección Holiday. ${userText}`,
        String(conjuntoId),
        "text",
      );
      setMessages((prev) => [...prev, { from: "assistant", text: response.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "assistant", text: "⚠️ No pude procesar tu pregunta. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg flex items-center justify-center text-2xl transition-all"
        title="Asistente Holiday"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[400px] h-[520px] bg-gray-900 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-cyan-700">
          {/* Header */}
          <div className="bg-cyan-700 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🏖️</span>
            <div>
              <p className="font-semibold text-sm">Asistente Holiday</p>
              <p className="text-xs text-cyan-200">Pregunta lo que necesites</p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-800"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.from === "user"
                    ? "bg-cyan-600 ml-auto text-right"
                    : "bg-gray-700 mr-auto text-left"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 animate-pulse text-sm">🤖 Escribiendo...</div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 bg-gray-850 border-t border-gray-700 flex gap-2 overflow-x-auto">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                disabled={loading}
                className="shrink-0 text-xs bg-gray-700 hover:bg-cyan-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-900 flex gap-2">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
