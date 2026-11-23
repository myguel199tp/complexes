import { ReactNode } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/app/components/ui/form";
import { Assembly, PollResult } from "../services/assemblies.types";

/*
 * Piezas visuales de las asambleas, compartidas por el listado y la sala.
 *
 * Todo el texto lleva su color en claro y en oscuro (`text-slate-* dark:…`). La
 * regla global de tema claro solo oscurece `text-white` y los cian claros; los
 * `text-gray-300` que había quedaban casi invisibles de día. Por la misma
 * razón aquí no se usa `text-white` fuera de los botones de color.
 */

export const CARD =
  "rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-700/70 dark:bg-slate-900/70";

export const MUTED = "text-sm text-slate-600 dark:text-slate-300";

type Tone = "slate" | "cyan" | "emerald" | "amber" | "rose";

const TONES: Record<Tone, string> = {
  slate:
    "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20",
  cyan: "bg-cyan-50 text-cyan-800 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/25",
  emerald:
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  amber:
    "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25",
};

export function Chip({
  tone = "slate",
  icon,
  className,
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Estado de la asamblea para la etiqueta. El backend no guarda uno: lo que
 * decide si se vota es `closed` y la ventana `startDate`–`endDate`, que es lo
 * mismo que revisa antes de aceptar un voto.
 */
export function getAssemblyStatus(assembly?: Partial<Assembly>) {
  if (!assembly) return null;

  if (assembly.closed) {
    return { key: "closed", label: "Cerrada", tone: "slate" as Tone };
  }

  const now = Date.now();

  if (assembly.startDate && new Date(assembly.startDate).getTime() > now) {
    return { key: "scheduled", label: "Programada", tone: "amber" as Tone };
  }

  if (assembly.endDate && new Date(assembly.endDate).getTime() < now) {
    return { key: "ended", label: "Finalizada", tone: "slate" as Tone };
  }

  return { key: "live", label: "En curso", tone: "emerald" as Tone };
}

export function AssemblyStatusChip({
  assembly,
}: {
  assembly?: Partial<Assembly>;
}) {
  const status = getAssemblyStatus(assembly);

  if (!status) return null;

  return (
    <Chip
      tone={status.tone}
      icon={
        status.key === "live" ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        ) : null
      }
    >
      {status.label}
    </Chip>
  );
}

export const formatPercent = (value: number) =>
  `${(Number(value) || 0).toLocaleString("es-CO", {
    maximumFractionDigits: 1,
  })}%`;

export const formatDateTime = (date?: string) =>
  date
    ? new Date(date).toLocaleString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

interface PollOptionListProps {
  poll: PollResult;
  /** Opción marcada y aún sin confirmar. */
  selectedId?: string | null;
  /** Opción que la persona votó en esta sesión. */
  votedId?: string | null;
  /** Sin `onSelect` las opciones son solo lectura (asamblea cerrada, listado). */
  onSelect?: (optionId: string) => void;
  disabled?: boolean;
}

/**
 * Opciones de una pregunta con su resultado en vivo.
 *
 * La marca vertical de cada barra es el porcentaje que exige la pregunta: deja
 * ver de un vistazo cuánto le falta a la opción que va ganando.
 */
export function PollOptionList({
  poll,
  selectedId,
  votedId,
  onSelect,
  disabled,
}: PollOptionListProps) {
  const showResults = poll.emitidos > 0;
  const threshold = Math.min(Math.max(poll.requiredPercentage, 0), 100);

  return (
    <ul
      className="space-y-2"
      role={onSelect ? "radiogroup" : undefined}
      aria-label={onSelect ? poll.question : undefined}
    >
      {poll.options.map((option) => {
        const isChecked = option.id === selectedId || option.id === votedId;
        const isWinner = showResults && poll.winner?.id === option.id;
        const interactive = !!onSelect;

        const content = (
          <>
            <div className="flex items-center gap-3">
              {(interactive || votedId) && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                    isChecked
                      ? "border-cyan-600 bg-cyan-600"
                      : "border-slate-300 dark:border-slate-500",
                  )}
                >
                  {isChecked && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
              )}

              <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">
                {option.option}
              </span>

              {showResults && (
                <span
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    isWinner
                      ? "text-cyan-700 dark:text-cyan-300"
                      : "text-slate-600 dark:text-slate-300",
                  )}
                >
                  {formatPercent(option.percent)}
                </span>
              )}
            </div>

            {showResults && (
              <div className="relative mt-2.5 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isWinner && poll.approved
                      ? "bg-emerald-500"
                      : isWinner
                        ? "bg-cyan-500"
                        : "bg-slate-400 dark:bg-slate-500",
                  )}
                  style={{ width: `${Math.min(option.percent, 100)}%` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 -top-1 w-0.5 rounded-full bg-slate-700 dark:bg-slate-200"
                  style={{ left: `calc(${threshold}% - 1px)` }}
                />
              </div>
            )}
          </>
        );

        const box = cn(
          "block w-full rounded-xl border px-3.5 py-3 text-left transition",
          isChecked
            ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/25 dark:border-cyan-400 dark:bg-cyan-500/10"
            : "border-slate-200 bg-slate-50/60 dark:border-slate-700/70 dark:bg-slate-800/40",
        );

        return (
          <li key={option.id}>
            {interactive ? (
              <button
                type="button"
                role="radio"
                aria-checked={isChecked}
                disabled={disabled}
                onClick={() => onSelect(option.id)}
                className={cn(
                  box,
                  !isChecked &&
                    "hover:border-cyan-400 hover:bg-cyan-50/60 dark:hover:border-cyan-500/60 dark:hover:bg-slate-800",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {content}
              </button>
            ) : (
              <div className={box}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Resultado de la pregunta, con la marca del umbral explicada. */
export function PollOutcome({
  poll,
  closed,
}: {
  poll: PollResult;
  closed?: boolean;
}) {
  let badge: ReactNode;

  if (poll.emitidos <= 0) {
    badge = <Chip>Sin votos todavía</Chip>;
  } else if (poll.approved) {
    badge = (
      <Chip tone="emerald" icon={<FiCheckCircle className="shrink-0" />}>
        <span className="min-w-0 truncate">
          {`${closed ? "Aprobada" : "Por ahora se aprueba"}: «${poll.winner?.option ?? ""}»`}
        </span>
      </Chip>
    );
  } else if (poll.tie) {
    badge = <Chip tone="amber">Empate: no hay decisión</Chip>;
  } else {
    badge = (
      <Chip tone={closed ? "rose" : "slate"}>
        {closed ? "No aprobada" : "Aún no alcanza el porcentaje"}
      </Chip>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {badge}

      {poll.emitidos > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-3 w-0.5 rounded-full bg-slate-700 dark:bg-slate-200" />
          Umbral {formatPercent(poll.requiredPercentage)}
        </span>
      )}
    </div>
  );
}
