"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAssembliesQuery } from "./queries/assemblies.queries";

import { Text } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { useAttendAssemblyMutation } from "./queries/assemblies.querie";

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
  const router = useRouter();

  const { data, isLoading } = useAssembliesQuery();

  const attendMutation = useAttendAssemblyMutation();

  const [openPolls, setOpenPolls] = useState<Record<string, boolean>>({});

  const togglePoll = (pollId: string) => {
    setOpenPolls((prev) => ({
      ...prev,
      [pollId]: !prev[pollId],
    }));
  };

  const handleAttend = async (assemblyId: string) => {
    try {
      await attendMutation.mutateAsync(assemblyId);

      router.push(`/my-convention/${assemblyId}`);
    } catch (error) {
      console.error("Error registrando asistencia:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Text className="text-2xl font-semibold">Asambleas</Text>

      {data?.map((assembly) => (
        <div
          key={assembly.id}
          className="bg-white rounded-xl shadow-sm border p-6 space-y-5"
        >
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

            <button
              onClick={() => handleAttend(assembly.id)}
              disabled={attendMutation.isPending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {attendMutation.isPending
                ? "Registrando asistencia..."
                : "Ir a votar"}
            </button>
          </div>

          {assembly.description && (
            <p className="text-sm text-gray-600">{assembly.description}</p>
          )}

          <div className="space-y-4">
            <Text className="font-medium">Encuestas</Text>

            {assembly.polls.map((poll) => {
              const isOpen = openPolls[poll.id];

              return (
                <div key={poll.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">{poll.question}</p>

                    <button
                      onClick={() => togglePoll(poll.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {isOpen ? "Ocultar resultados" : "Ver resultados"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="space-y-3 mt-3">
                      {(() => {
                        const totalVotes = poll.options.reduce(
                          (acc, opt) => acc + (opt.votes || 0),
                          0,
                        );

                        if (totalVotes === 0) {
                          return (
                            <p className="text-xs text-gray-500">
                              Aún no hay votos en esta encuesta
                            </p>
                          );
                        }

                        const winner = poll.options.reduce((prev, current) =>
                          (current.votes || 0) > (prev.votes || 0)
                            ? current
                            : prev,
                        );

                        return (
                          <>
                            {poll.options.map((opt) => {
                              const percent = Math.round(
                                ((opt.votes || 0) / totalVotes) * 100,
                              );

                              return (
                                <div key={opt.id}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{opt.option}</span>
                                    <span>{percent}%</span>
                                  </div>

                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        opt.id === winner.id
                                          ? "bg-green-500"
                                          : "bg-gray-400"
                                      }`}
                                      style={{
                                        width: `${percent}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}

                            <p className="text-xs text-gray-500 mt-2">
                              Opción ganadora:{" "}
                              <span className="font-medium text-green-600">
                                {winner.option}
                              </span>
                            </p>
                          </>
                        );
                      })()}
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
