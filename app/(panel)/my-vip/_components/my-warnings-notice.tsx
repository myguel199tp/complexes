"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdWarningAmber } from "react-icons/md";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getMyWarningsService } from "../services/myWarningsService";
import { formatDay } from "@/app/(panel)/my-new-user/_components/modal/unit-discipline-history";

/**
 * Llamados de atención que la administración le envió al residente. No son
 * multas ni cobran nada; se muestran para que sepa qué corregir y hasta cuándo.
 */
export default function MyWarningsNotice() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [expanded, setExpanded] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-warnings", conjuntoId],
    queryFn: () => getMyWarningsService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading || data.length === 0) return null;

  const visible = expanded ? data : data.slice(0, 1);

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="flex items-start gap-2">
        <MdWarningAmber className="mt-0.5 shrink-0 text-lg text-amber-600 dark:text-amber-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Tienes {data.length} llamado{data.length === 1 ? "" : "s"} de atención
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-200/80">
            No es una multa ni genera cobro. Si la conducta continúa, la
            administración puede imponer una multa.
          </p>

          <ul className="mt-3 space-y-2">
            {visible.map((warning) => (
              <li
                key={warning.id}
                className="rounded-md border border-amber-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {warning.title}
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                  {warning.reason}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enviado el{" "}
                  {new Date(warning.createdAt).toLocaleDateString("es-CO", {
                    timeZone: "America/Bogota",
                  })}
                  {warning.correctionDeadline
                    ? ` · Plazo para corregir: ${formatDay(warning.correctionDeadline)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>

          {data.length > 1 && (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-amber-800 hover:underline dark:text-amber-200"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Ver menos" : `Ver los ${data.length}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
