"use client";

import { useState, useEffect, useRef } from "react";
import { AiAssistantService } from "../services/aiAssistantService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const aiService = new AiAssistantService();

interface propsType {
  from: string;
  text: string;
  data?: any[];
}

export default function AssistantChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<propsType[]>([
    {
      from: "assistant",
      text: "¡Hola! 🤖 Soy tu asistente AI.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyTableToClipboard = (data?: any[]) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers.map((header) => String(row[header] ?? "")).join("\t"),
    );

    const tableText = [headers.join("\t"), ...rows].join("\n");

    navigator.clipboard.writeText(tableText);
  };

  // Auto scroll
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
      const response = await aiService.sendMessage(message, String(conjuntoId));

      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: response.text,
          data: response.data,
        },
      ]);
    } catch (error) {
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
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      {/* MENSAJES */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-800 rounded-lg"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] p-3 rounded-lg ${
              msg.from === "user"
                ? "bg-cyan-600 ml-auto text-right"
                : "bg-gray-700 mr-auto text-left"
            }`}
          >
            {/* TEXTO */}
            <p>{msg.text}</p>

            {/* TABLA DINÁMICA */}
            {msg.data && msg.data.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => copyTableToClipboard(msg.data)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                  >
                    📋 Copiar tabla
                  </button>
                </div>
                <table className="w-full border border-gray-600 text-sm">
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
          <div className="text-gray-400 animate-pulse">Escribiendo...</div>
        )}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none"
          placeholder="Escribe tu pregunta..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg font-semibold"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
