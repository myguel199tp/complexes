"use client";

import Link from "next/link";
import { useAssembliesQuery } from "./queries/assemblies.queries";
import { Text } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { useState } from "react";

/** Helper para formatear fechas */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AssembliesPage() {
  const { data, isLoading } = useAssembliesQuery();

  // Guarda qué encuesta está abierta
  const [openPolls, setOpenPolls] = useState<Record<string, boolean>>({});

  const togglePoll = (pollId: string) => {
    setOpenPolls((prev) => ({
      ...prev,
      [pollId]: !prev[pollId],
    }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <Text className="text-2xl font-semibold">Asambleas</Text>

      {data?.map((assembly: any) => (
        <div
          key={assembly.id}
          className="bg-white rounded-xl shadow-sm border p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h2 className="text-lg font-semibold">{assembly.title}</h2>

              <p className="text-sm text-gray-500">
                {assembly.typeAssembly} · {assembly.mode}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                📅 {formatDate(assembly.startDate)} –{" "}
                {formatDate(assembly.endDate)}
              </p>
            </div>

            <Link
              href={`/my-convention/${assembly.id}/vote`}
              className="px-4 py-2 text-sm font-medium rounded-lg
                         bg-cyan-600 text-white hover:bg-cyan-700 transition"
            >
              Ir a votar
            </Link>
          </div>

          {/* Description */}
          {assembly.description && (
            <p className="text-sm text-gray-600">{assembly.description}</p>
          )}

          {/* Polls */}
          <div className="space-y-4">
            <Text className="font-medium">Encuestas</Text>

            {assembly.polls.map((poll: any) => {
              const isOpen = openPolls[poll.id];

              return (
                <div key={poll.id} className="border rounded-lg p-4 space-y-3">
                  {/* Pregunta + botón */}
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{poll.question}</p>

                    <button
                      onClick={() => togglePoll(poll.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {isOpen ? "Ocultar resultados" : "Ver resultados"}
                    </button>
                  </div>

                  {/* Resultados */}
                  {isOpen && (
                    <div className="space-y-3 mt-3">
                      {poll.options.map((opt: any, index: number) => {
                        // ⚠️ SOLO UI (simulado)
                        const percent = index === 0 ? 65 : 35;

                        return (
                          <div key={opt.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{opt.option}</span>
                              <span>{percent}%</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  index === 0 ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <p className="text-xs text-gray-500 mt-2">
                        Opción ganadora:{" "}
                        <span className="font-medium text-green-600">
                          {poll.options[0].option}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
