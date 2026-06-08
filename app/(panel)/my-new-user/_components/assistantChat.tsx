"use client";

import { useEffect, useRef, useState } from "react";
import { AiAssistantService } from "../services/aiAssistantService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const aiService = new AiAssistantService();

type TextMessage = {
  from: "user" | "assistant";
  type?: "text";
  text: string;
};

type TableMessage = {
  from: "assistant";
  type: "table";
  text: string;
  data: Record<string, unknown>[];
  meta?: {
    action?: string;
  };
};

type AssistantMessage = TextMessage | TableMessage;

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionType {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconBot() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M12 2a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2Zm-2 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm6.5 9a.5.5 0 0 1 .5.5A7 7 0 0 1 12.5 17v2.5H15a.5.5 0 0 1 0 1H9a.5.5 0 0 1 0-1h2.5V17A7 7 0 0 1 5 10.5a.5.5 0 0 1 1 0A6 6 0 0 0 18 10.5a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M3.75 5.25a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-4.5a1.5 1.5 0 0 1-1.5-1.5V5.25Zm9 0a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-4.5a1.5 1.5 0 0 1-1.5-1.5V5.25Z" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5"
    >
      <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
      <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssistantChat() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const [message, setMessage] = useState("");
  const [format, setFormat] = useState<"text" | "table">("text");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      from: "assistant",
      text: "Hola, soy tu asistente. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [aiFlow, setAiFlow] = useState<{ active: boolean; action?: string }>({
    active: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Clean text for speech ────────────────────────────────────────────────

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/\$/g, "pesos")
      .replace(
        /([✀-➿]|[-]|[\uD83C-􏰀-\uDFFF]+)/g,
        "",
      )
      .trim();
  };

  // ── Text to speech ───────────────────────────────────────────────────────

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const cleanText = cleanTextForSpeech(text);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((v) => v.name.includes("Elvira")) ||
      voices.find((v) => v.name.includes("Sabina")) ||
      voices.find((v) => v.name.includes("Helena")) ||
      voices.find((v) => v.name.includes("Paulina")) ||
      voices.find((v) => v.name.includes("Laura")) ||
      voices.find(
        (v) => v.lang === "es-CO" && v.name.toLowerCase().includes("female"),
      ) ||
      voices.find((v) => v.lang.startsWith("es"));

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = "es-CO";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  // ── Speech recognition ───────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognitionClass =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Error reconocimiento voz:", e.error);
      setIsListening(false);
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      setMessage(e.results[0][0].transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  // ── Auto scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ── Copy table ───────────────────────────────────────────────────────────

  const copyTableToClipboard = (data: Record<string, unknown>[]) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => String(row[h] ?? "")).join("\t"),
    );
    navigator.clipboard.writeText([headers.join("\t"), ...rows].join("\n"));
  };

  // ── Start listening ──────────────────────────────────────────────────────

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error iniciando reconocimiento:", error);
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        userMessage,
        String(conjuntoId),
        format,
      );

      if (response.meta?.action === "create_provider") {
        setAiFlow({ active: true, action: "create_provider" });
      }

      if (response.type === "table" && response.data) {
        setMessages((prev) => [
          ...prev,
          {
            from: "assistant",
            type: "table",
            text: response.text,
            data: response.data,
            meta: response.meta,
          },
        ]);
        speakText(response.text);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "assistant", type: "text", text: response.text },
        ]);
        speakText(response.text);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = "Ocurrió un error al procesar la solicitud.";
      setMessages((prev) => [
        ...prev,
        { from: "assistant", text: errorMessage },
      ]);
      speakText(errorMessage);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700/60">
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
          <IconBot />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">
            Asistente IA
          </p>
          <p className="text-xs text-emerald-400 leading-tight">En línea</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar assistant */}
            {msg.from === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 text-white">
                <IconBot />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.from === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>

              {/* TABLE */}
              {msg.type === "table" &&
                (msg as TableMessage).data?.length > 0 && (
                  <div className="mt-3 w-full overflow-x-auto">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          copyTableToClipboard((msg as TableMessage).data)
                        }
                        className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <IconCopy />
                        Copiar tabla
                      </button>
                    </div>
                    <table className="min-w-max border-collapse text-xs">
                      <thead>
                        <tr>
                          {Object.keys((msg as TableMessage).data[0]).map(
                            (key) => (
                              <th
                                key={key}
                                className="border border-slate-600 px-3 py-2 bg-slate-700 font-medium text-slate-200 text-left whitespace-nowrap"
                              >
                                {key}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(msg as TableMessage).data.map((row, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-slate-800" : "bg-slate-750"
                            }
                          >
                            {Object.values(row).map((value, j) => (
                              <td
                                key={j}
                                className="border border-slate-600/60 px-3 py-2 text-slate-300 whitespace-nowrap"
                              >
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 text-white">
              <IconBot />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-700/60 p-3 space-y-2">
        {/* Format select */}
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "text" | "table")}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="text">Respuesta en texto</option>
          <option value="table">Mostrar en tabla</option>
        </select>

        {/* Input row */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder={
              aiFlow.active ? "Procesando..." : "Escribe tu pregunta..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) sendMessage();
            }}
          />

          {/* Mic */}
          <button
            onClick={startListening}
            type="button"
            title={isListening ? "Detener micrófono" : "Usar micrófono"}
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? "bg-red-600 animate-pulse text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            <IconMic />
          </button>

          {/* Stop audio */}
          <button
            type="button"
            title="Detener audio"
            onClick={() => window.speechSynthesis.cancel()}
            className="h-10 w-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center shrink-0 transition-all"
          >
            <IconStop />
          </button>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            type="button"
            title="Enviar mensaje"
            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all"
          >
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}
