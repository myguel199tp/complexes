"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImSpinner9 } from "react-icons/im";
import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiChevronUp,
} from "react-icons/fi";

import {
  useAssembliesQuery,
  useAssemblyPollsQuery,
} from "./queries/assemblies.queries";
import { useAttendAssemblyMutation } from "./queries/assemblies.querie";
import {
  AssemblyStatusChip,
  CARD,
  Chip,
  MUTED,
  PollOptionList,
  PollOutcome,
  formatDateTime,
  getAssemblyStatus,
} from "./components/assembly-ui";
import {
  ASSEMBLY_MODE_LABELS,
  ASSEMBLY_TYPE_LABELS,
  Assembly,
  PollResult,
} from "./services/assemblies.types";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { Button } from "@/app/components/ui/form";

/**
 * Resultados del orden del día, pedidos solo al abrirlos.
 *
 * El listado trae las preguntas sin votos (las opciones no los guardan), así
 * que "Ver resultados" siempre decía que no había votos. Los porcentajes salen
 * del mismo endpoint que usa la sala.
 */
function AssemblyResults({
  assemblyId,
  closed,
}: {
  assemblyId: string;
  closed: boolean;
}) {
  const { data, isLoading, error } = useAssemblyPollsQuery(assemblyId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <ImSpinner9 className="animate-spin text-cyan-700" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-700 dark:text-rose-300">
        {(error as Error).message || "No se pudieron cargar los resultados"}
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {(data ?? []).map((poll: PollResult, index: number) => (
        <li key={poll.pollId} className="space-y-2.5">
          <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span className="mr-1.5 text-cyan-700 dark:text-cyan-300">
              {index + 1}.
            </span>
            {poll.question}
          </p>
          <PollOptionList poll={poll} />
          <PollOutcome poll={poll} closed={closed} />
        </li>
      ))}
    </ol>
  );
}

export default function AssembliesPage() {
  const router = useRouter();

  const { data, isLoading } = useAssembliesQuery();

  const attendMutation = useAttendAssemblyMutation();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [openResults, setOpenResults] = useState<Record<string, boolean>>({});

  const toggleResults = (assemblyId: string) => {
    setOpenResults((prev) => ({
      ...prev,
      [assemblyId]: !prev[assemblyId],
    }));
  };

  const handleAttend = async (assemblyId: string) => {
    try {
      await attendMutation.mutateAsync(assemblyId);

      router.push(`/my-convention/${assemblyId}`);
    } catch (error) {
      console.error("Error registrando asistencia:", error);
      showAlert(
        error instanceof Error && error.message
          ? error.message
          : "No se pudo registrar la asistencia",
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const assemblies: Assembly[] = data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-1 md:p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">
          Asambleas
        </h1>
        <p className={`mt-1 ${MUTED}`}>
          Revisa el orden del día y vota en las asambleas de tu conjunto.
        </p>
      </div>

      {assemblies.length === 0 && (
        <div
          className={`${CARD} border-dashed px-4 py-10 text-center ${MUTED}`}
        >
          No hay asambleas por ahora.
        </div>
      )}

      {assemblies.map((assembly) => {
        const status = getAssemblyStatus(assembly);
        // Cerrada o vencida ya no admite votos: se entra directo a ver los
        // resultados, sin registrar una asistencia que no cuenta (y que el
        // backend rechaza si está cerrada).
        const finished = status?.key === "closed" || status?.key === "ended";
        const isAttending =
          attendMutation.isPending && attendMutation.variables === assembly.id;
        const polls = assembly.polls ?? [];
        const resultsOpen = !!openResults[assembly.id];

        return (
          <article key={assembly.id} className={`${CARD} p-4 md:p-6`}>
            <div className="flex flex-wrap gap-1.5">
              <AssemblyStatusChip assembly={assembly} />
              {assembly.typeAssembly && (
                <Chip tone="cyan">
                  {ASSEMBLY_TYPE_LABELS[assembly.typeAssembly] ??
                    assembly.typeAssembly}
                </Chip>
              )}
              {assembly.mode && (
                <Chip>
                  {ASSEMBLY_MODE_LABELS[assembly.mode] ?? assembly.mode}
                </Chip>
              )}
            </div>

            <h2 className="mt-3 break-words text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
              {assembly.title}
            </h2>

            {assembly.description && (
              <p className={`mt-1 leading-relaxed ${MUTED}`}>
                {assembly.description}
              </p>
            )}

            <p className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
              <FiCalendar className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan-300" />
              <span>
                {formatDateTime(assembly.startDate)}
                {assembly.endDate && ` – ${formatDateTime(assembly.endDate)}`}
              </span>
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700/70 dark:bg-slate-800/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Orden del día · {polls.length}
                </p>

                {polls.length > 0 && (
                  <Button
                    size="xs"
                    rounded="sm"
                    variant="ghost"
                    colVariant="primary"
                    className="text-cyan-700 dark:text-cyan-300"
                    leftIcon={resultsOpen ? <FiChevronUp /> : <FiBarChart2 />}
                    onClick={() => toggleResults(assembly.id)}
                  >
                    {resultsOpen ? "Ocultar resultados" : "Ver resultados"}
                  </Button>
                )}
              </div>

              <div className="mt-2.5">
                {polls.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aún no tiene preguntas.
                  </p>
                ) : resultsOpen ? (
                  <AssemblyResults
                    assemblyId={assembly.id}
                    closed={!!assembly.closed}
                  />
                ) : (
                  <ol className="space-y-1.5">
                    {polls.map((poll, index) => (
                      <li
                        key={poll.id}
                        className="flex gap-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span className="shrink-0 font-semibold text-cyan-700 dark:text-cyan-300">
                          {index + 1}.
                        </span>
                        <span className="min-w-0 break-words">
                          {poll.question}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                size="md"
                rounded="sm"
                colVariant="primary"
                variant={finished ? "outline" : "solid"}
                className="w-full sm:w-auto"
                rightIcon={<FiArrowRight />}
                loading={isAttending}
                disabled={attendMutation.isPending}
                onClick={() =>
                  finished
                    ? router.push(`/my-convention/${assembly.id}`)
                    : handleAttend(assembly.id)
                }
              >
                {isAttending
                  ? "Registrando asistencia..."
                  : finished
                    ? "Ver detalle"
                    : "Ir a votar"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
