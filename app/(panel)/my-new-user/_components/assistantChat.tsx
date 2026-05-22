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

// =========================
// SPEECH TYPES
// =========================

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

export default function AssistantChat() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const [message, setMessage] = useState("");

  const [format, setFormat] = useState<"text" | "table">("text");

  const [loading, setLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      from: "assistant",
      text: "¡Hola! Soy tu asistente y estoy para ayudarte.",
    },
  ]);

  const [aiFlow, setAiFlow] = useState<{
    active: boolean;
    action?: string;
  }>({
    active: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  // =========================
  // CLEAN TEXT FOR SPEECH
  // =========================

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
      .replace(/[📋➤🔇🤖📝📊🎤🛑⚠️]/gu, "")
      .trim();
  };

  // =========================
  // TEXT TO SPEECH
  // =========================

  const speakText = (text: string) => {
    if (typeof window === "undefined") return;

    if (!window.speechSynthesis) return;

    // ✅ limpiar emojis antes de hablar
    const cleanText = cleanTextForSpeech(text);

    // detener voz anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();

    // ✅ PRIORIDAD VOCES FEMENINAS NATURALES
    const preferredVoice =
      voices.find((voice) => voice.name.includes("Elvira")) ||
      voices.find((voice) => voice.name.includes("Sabina")) ||
      voices.find((voice) => voice.name.includes("Helena")) ||
      voices.find((voice) => voice.name.includes("Paulina")) ||
      voices.find((voice) => voice.name.includes("Laura")) ||
      voices.find(
        (voice) =>
          voice.lang === "es-CO" && voice.name.toLowerCase().includes("female"),
      ) ||
      voices.find((voice) => voice.lang.startsWith("es"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = "es-CO";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };
  // =========================
  // SPEECH RECOGNITION INIT
  // =========================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as SpeechRecognitionWindow;

    const SpeechRecognitionClass =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn("SpeechRecognition no soportado");
      return;
    }

    const recognition = new SpeechRecognitionClass();

    recognition.lang = "es-ES";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error reconocimiento voz:", event.error);

      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;

      setMessage(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // COPY TABLE
  // =========================

  const copyTableToClipboard = (data: Record<string, unknown>[]) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers.map((header) => String(row[header] ?? "")).join("\t"),
    );

    const tableText = [headers.join("\t"), ...rows].join("\n");

    navigator.clipboard.writeText(tableText);
  };

  // =========================
  // START LISTENING
  // =========================

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz");

      return;
    }

    // ✅ evitar doble start
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

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text: userMessage,
      },
    ]);

    setMessage("");

    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        userMessage,
        String(conjuntoId),
        format,
      );

      // activar flujo IA
      if (response.meta?.action === "create_provider") {
        setAiFlow({
          active: true,
          action: "create_provider",
        });
      }

      // RESPUESTA TABLA
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
        // RESPUESTA TEXTO
        setMessages((prev) => [
          ...prev,
          {
            from: "assistant",
            type: "text",
            text: response.text,
          },
        ]);

        speakText(response.text);
      }
    } catch (error) {
      console.error(error);

      const errorMessage = "⚠️ Ocurrió un error al procesar la solicitud.";

      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: errorMessage,
        },
      ]);

      speakText(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* CHAT */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-800"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[90%] md:max-w-[75%] p-3 rounded-lg text-sm md:text-base ${
              msg.from === "user"
                ? "bg-cyan-600 ml-auto text-right"
                : "bg-gray-700 mr-auto text-left"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.text}</p>

            {/* TABLE */}
            {msg.type === "table" && msg.data?.length > 0 && (
              <div className="mt-3 w-full overflow-x-auto">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => copyTableToClipboard(msg.data)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                  >
                    📋 Copiar tabla
                  </button>
                </div>

                <table className="min-w-max border border-gray-600 text-xs md:text-sm">
                  <thead>
                    <tr>
                      {Object.keys(msg.data[0]).map((key) => (
                        <th
                          key={key}
                          className="border border-gray-600 px-2 py-1 bg-gray-600"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {msg.data.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, j) => (
                          <td
                            key={j}
                            className="border border-gray-600 px-2 py-1"
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
        ))}

        {/* LOADING */}
        {loading && (
          <div className="text-gray-400 animate-pulse text-sm">
            🤖 Escribiendo...
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      {/* INPUT AREA */}
      <div className="p-3 border-t border-gray-700 bg-gray-900">
        {/* SELECT */}
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "text" | "table")}
          className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-3 text-sm w-full mb-3"
        >
          <option value="text">📝 Respuesta normal</option>

          <option value="table">📊 Mostrar en tabla</option>
        </select>

        {/* INPUT + BUTTONS */}
        <div className="flex items-center gap-2">
          {/* INPUT */}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="
        flex-1
        min-w-0
        bg-gray-700
        border
        border-gray-600
        rounded-xl
        px-4
        py-3
        focus:outline-none
        text-sm
      "
            placeholder={
              aiFlow.active
                ? "Estoy creando el proveedor..."
                : "Escribe tu pregunta..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          {/* MIC BUTTON */}
          <button
            onClick={startListening}
            type="button"
            className={`
        h-12
        min-w-[52px]
        px-3
        rounded-xl
        font-semibold
        transition-all
        flex
        items-center
        justify-center
        ${
          isListening
            ? "bg-red-500 animate-pulse"
            : "bg-gray-700 hover:bg-gray-600"
        }
      `}
          >
            {isListening ? "🛑" : "🎤"}
          </button>

          {/* STOP VOICE BUTTON */}
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.cancel();
            }}
            className="
        h-12
        min-w-[52px]
        px-3
        rounded-xl
        bg-orange-500
        hover:bg-orange-600
        transition-all
        flex
        items-center
        justify-center
      "
          >
            🔇
          </button>

          {/* SEND BUTTON */}
          <button
            onClick={sendMessage}
            disabled={loading}
            type="button"
            className="
        h-12
        px-4
        rounded-xl
        bg-cyan-500
        hover:bg-cyan-600
        font-semibold
        transition-all
        disabled:opacity-50
        whitespace-nowrap
      "
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
