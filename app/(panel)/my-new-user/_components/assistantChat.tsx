"use client";

import { useState, useEffect, useRef } from "react";
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
};

type AssistantMessage = TextMessage | TableMessage;

export default function AssistantChat() {
  const [message, setMessage] = useState("");
  const [format, setFormat] = useState<"text" | "table">("text");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      from: "assistant",
      text: "¡Hola! 🤖 Soy tu asistente estoy para ayudarte.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyTableToClipboard = (data: Record<string, unknown>[]) => {
    if (!data?.length) return;

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers.map((header) => String(row[header] ?? "")).join("\t"),
    );

    const tableText = [headers.join("\t"), ...rows].join("\n");

    navigator.clipboard.writeText(tableText);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: message }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        message,
        String(conjuntoId),
        format,
      );

      if (response.type === "table" && response.data) {
        setMessages((prev) => [
          ...prev,
          {
            from: "assistant",
            type: "table",
            text: response.text,
            data: response.data,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            from: "assistant",
            type: "text",
            text: response.text,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: "⚠️ Ocurrió un error al procesar la solicitud.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-900 text-white p-3 md:p-4 rounded-lg shadow-lg">
      {/* CHAT AREA */}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-800 rounded-lg"
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

        {loading && (
          <div className="text-gray-400 animate-pulse text-sm">
            🤖 Escribiendo...
          </div>
        )}
      </div>

      {/* INPUT AREA */}

      <div className="flex flex-col md:flex-row gap-2 mt-4">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "text" | "table")}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-full md:w-auto"
        >
          <option value="text">📝 Respuesta normal</option>
          <option value="table">📊 Mostrar en tabla</option>
        </select>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none text-sm md:text-base"
          placeholder="Escribe tu pregunta..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold w-full md:w-auto"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
