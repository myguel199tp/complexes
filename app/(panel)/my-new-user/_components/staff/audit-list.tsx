"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { modal as m } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  ConjuntoAuditEntity,
  ConjuntoAuditFilters,
  listConjuntoAudit,
} from "../../services/conjuntoAuditService";
import { formatDateTime } from "./staff-format";

export const AUDIT_ENTITY_LABELS: Record<ConjuntoAuditEntity, string> = {
  news: "Noticias",
  record: "Documentos",
  certification: "Certificados",
  bank_account: "Cuentas bancarias",
  collection_agreement: "Convenios de recaudo",
  ownership: "Traspasos",
  resident: "Residentes",
  admin: "Administración",
  council: "Consejo",
};

const PAGE_SIZE = 20;

interface Props {
  /** Filtros fijos: los de un periodo (quién y entre qué fechas). */
  filters?: Omit<ConjuntoAuditFilters, "page" | "limit" | "entityType">;
  /** Con selector de tipo de registro (la bitácora completa). */
  withTypeFilter?: boolean;
  /** Mostrar quién lo hizo (sobra cuando ya es la lista de una persona). */
  showActor?: boolean;
  emptyText?: string;
}

/**
 * Entradas de la bitácora del conjunto, de la más reciente a la más vieja.
 * Va dentro del Modal de la librería, que es siempre blanco: colores claros
 * sin variante `dark:`.
 */
export default function AuditList({
  filters = {},
  withTypeFilter = false,
  showActor = true,
  emptyText = "No hay registros.",
}: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<ConjuntoAuditEntity | "">("");

  const query = { ...filters, entityType, page, limit: PAGE_SIZE };

  const { data, isLoading, error } = useQuery({
    queryKey: ["conjunto_audit", conjuntoId, query],
    queryFn: () => listConjuntoAudit(conjuntoId, query),
    enabled: !!conjuntoId,
  });

  const pages = data ? Math.max(Math.ceil(data.total / data.limit), 1) : 1;

  return (
    <div className="space-y-3">
      {withTypeFilter && (
        <label className="block">
          <span className={m.label}>Tipo de registro</span>
          <select
            className={m.input}
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value as ConjuntoAuditEntity | "");
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {isLoading && <p className={m.muted}>Cargando…</p>}

      {error && (
        <p className="text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar la bitácora."}
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className={m.muted}>{emptyText}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {data.items.map((entry) => (
            <li key={entry.id} className="p-3">
              <p className={`text-sm ${m.strong}`}>{entry.summary}</p>
              <p className={m.muted}>
                {formatDateTime(entry.createdAt)} ·{" "}
                {AUDIT_ENTITY_LABELS[entry.entityType] ?? entry.entityType}
                {showActor ? ` · ${entry.actorName ?? "Sistema"}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      {data && pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Más recientes
          </button>
          <span className={m.muted}>
            Página {page} de {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Más antiguos
          </button>
        </div>
      )}
    </div>
  );
}
