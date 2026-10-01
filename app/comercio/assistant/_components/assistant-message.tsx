"use client";

import React from "react";
import type { ComercioAssistantReply } from "../services/comercioAssistantService";
import { Text } from "complexes-next-components";
import { IoThumbsDownOutline, IoThumbsUpOutline } from "react-icons/io5";

/**
 * Render mínimo del markdown que devuelve el asistente: **negrita**, _cursiva_
 * y saltos de línea. No se usa una librería completa porque el backend genera
 * el texto y solo emite estas tres marcas — y así ningún contenido se
 * interpreta como HTML.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <em key={key} className="text-slate-400">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function FormattedText({ text }: { text: string }) {
  return (
    <div className="space-y-1 text-sm leading-relaxed text-slate-200">
      {text.split("\n").map((line, index) =>
        line.trim() === "" ? (
          <div key={index} className="h-2" />
        ) : (
          <Text size="sm" key={index}>{renderInline(line, String(index))}</Text>
        ),
      )}
    </div>
  );
}

/** Convierte camelCase en un encabezado legible: `pedidosEnCurso` → `Pedidos en curso`. */
function humanizeColumn(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function ReplyTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return null;

  const columns = Object.keys(rows[0]);

  return (
    // La tabla desborda sola en móvil; el contenedor de la página nunca.
    <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-max text-left text-xs">
        <thead className="bg-white/[0.06] text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3 py-2 font-semibold">
                {humanizeColumn(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-white/5 text-slate-200 odd:bg-white/[0.02]"
            >
              {columns.map((column) => (
                <td key={column} className="whitespace-nowrap px-3 py-2">
                  {String(row[column] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AssistantMessage({
  reply,
  helpful,
  onRate,
}: {
  reply: ComercioAssistantReply;
  helpful?: boolean;
  /**
   * Sin él no hay pulgares. La pantalla solo lo pasa cuando la respuesta trae
   * `usageId`: el "no entendí", los saludos y los errores no se votan.
   */
  onRate?: (helpful: boolean) => void;
}) {
  return (
    <div className="max-w-full rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
      <FormattedText text={reply.text} />
      {reply.type === "table" && reply.data?.length ? (
        <ReplyTable rows={reply.data} />
      ) : null}

      {onRate ? (
        <div className="mt-2 flex items-center gap-1 border-t border-white/5 pt-2">
          <button
            type="button"
            onClick={() => onRate(true)}
            aria-pressed={helpful === true}
            aria-label="Esta respuesta me sirvió"
            title="Me sirvió"
            className={`rounded-lg p-1.5 transition ${
              helpful === true
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
            }`}
          >
            <IoThumbsUpOutline size={14} />
          </button>

          <button
            type="button"
            onClick={() => onRate(false)}
            aria-pressed={helpful === false}
            aria-label="Esta respuesta no me sirvió"
            title="No me sirvió"
            className={`rounded-lg p-1.5 transition ${
              helpful === false
                ? "bg-red-500/20 text-red-300"
                : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
            }`}
          >
            <IoThumbsDownOutline size={14} />
          </button>

          {helpful !== undefined ? (
            <span className="ml-1 text-[11px] text-slate-500">
              Gracias, lo tendremos en cuenta
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan-600/90 px-4 py-2.5 text-sm text-white">
      {text}
    </div>
  );
}
