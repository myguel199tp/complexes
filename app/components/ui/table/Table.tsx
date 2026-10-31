"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { cn } from "../form/utils";

export interface TableProps {
  headers: string[];
  /** Una fila por elemento; cada celda en el mismo orden que `headers`. */
  rows: ReactNode[][];
  /**
   * Clases por celda, alineadas con `rows` (no con la página visible). Se
   * mezclan con twMerge, así que un `bg-*` o `px-*` del llamador gana sobre el
   * del componente.
   */
  cellClasses?: string[][];
  /** Anchos sugeridos por columna (`"20%"`, `"120px"`…), solo en escritorio. */
  columnWidths?: string[];
  rowsPerPage?: number;
  /** Las filas ya vienen paginadas: la tabla solo pinta y avisa el cambio. */
  serverPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: ReactNode;
  className?: string;
}

/**
 * Páginas a mostrar: primera, última y vecinas de la actual. Un hueco de una
 * sola página se rellena con el número, porque "…" ocuparía el mismo sitio.
 */
function pageItems(current: number, total: number): (number | "gap")[] {
  const items: (number | "gap")[] = [];
  let prev = 0;
  for (let p = 1; p <= total; p++) {
    if (p !== 1 && p !== total && Math.abs(p - current) > 1) continue;
    if (p - prev === 2) items.push(prev + 1);
    else if (p - prev > 2) items.push("gap");
    items.push(p);
    prev = p;
  }
  return items;
}

/**
 * La columna de botones se reconoce por su cabecera: "Acciones" en el panel
 * (también vía `t("acciones")`, de ahí en/pt) y vacía en comercio, donde
 * siempre es la última.
 */
const ACTIONS_HEADER = /^(acciones|actions|ações)$/i;

const isActionsColumn = (header: string | undefined) =>
  !header?.trim() || ACTIONS_HEADER.test(header.trim());

/**
 * En la tarjeta móvil la celda de acciones es el pie de la tarjeta: a todo el
 * ancho y sin la etiqueta "Acciones". Antes iba en la misma fila que la
 * etiqueta, y una hilera de tres botones sin `flex-wrap` (Generar, Editar,
 * Eliminar) se salía por la derecha y la tarjeta la recortaba. Las celdas
 * suelen ser un `<div className="flex gap-2">` con los botones dentro: aquí
 * esa hilera baja de línea si no cabe, los botones directos se reparten el
 * ancho y todos miden al menos 40px de alto para poder tocarlos.
 */
const ACTIONS_CELL_MOBILE =
  "w-full min-w-0 max-md:[&>div]:flex-wrap max-md:[&>div>button]:flex-1 max-md:[&_button]:min-h-10";

const navButtonClass =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-800 disabled:pointer-events-none disabled:opacity-40";

/**
 * Tabla de datos del proyecto (reemplaza a la `Table` de
 * complexes-next-components).
 *
 * Es una superficie blanca propia —como los campos de `ui/form`— para leerse
 * igual en el panel claro, el oscuro y el comercio. En móvil cada fila pasa a
 * ser una tarjeta con la cabecera como etiqueta. Es un único `<table>` que
 * cambia de `display` por breakpoint y no dos marcados, para no montar dos
 * veces lo que vaya dentro de las celdas (modales, inputs, estado).
 */
export function Table({
  headers,
  rows,
  cellClasses = [],
  columnWidths = [],
  rowsPerPage = 15,
  serverPagination = false,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage,
  className,
}: TableProps) {
  const { t } = useTranslation();
  const [localPage, setLocalPage] = useState(1);

  const pageCount = Math.max(
    1,
    serverPagination ? (totalPages ?? 1) : Math.ceil(rows.length / rowsPerPage),
  );
  // Si un filtro deja menos filas, la página guardada puede quedar fuera.
  const page = Math.min(
    Math.max(serverPagination ? (currentPage ?? 1) : localPage, 1),
    pageCount,
  );
  const start = serverPagination ? 0 : (page - 1) * rowsPerPage;
  const visibleRows = serverPagination
    ? rows
    : rows.slice(start, start + rowsPerPage);

  const goTo = (next: number) => {
    if (next < 1 || next > pageCount || next === page) return;
    if (serverPagination) onPageChange?.(next);
    else setLocalPage(next);
  };

  return (
    <div
      className={cn(
        "mt-4 w-full md:overflow-hidden md:rounded-3xl md:border md:border-cyan-100 md:bg-white md:shadow-[0_10px_30px_-18px_rgba(8,47,73,0.45)]",
        className,
      )}
    >
      <div className="md:overflow-x-auto">
        <table className="block w-full text-sm md:table md:border-separate md:border-spacing-0">
          <thead className="hidden md:table-header-group">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  style={
                    columnWidths[i] ? { width: columnWidths[i] } : undefined
                  }
                  className="whitespace-nowrap border-b border-cyan-100 bg-cyan-50/70 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-cyan-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="block space-y-3 md:table-row-group md:space-y-0">
            {visibleRows.length === 0 ? (
              <tr className="block rounded-2xl border border-cyan-100 bg-white md:table-row md:rounded-none md:border-0">
                <td
                  colSpan={headers.length}
                  className="block px-4 py-10 text-center text-sm text-slate-500 md:table-cell"
                >
                  {emptyMessage ?? t("dataTable.empty")}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rowIndex) => (
                <tr
                  key={start + rowIndex}
                  className="group block overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_4px_16px_-8px_rgba(8,145,178,0.25)] md:table-row md:overflow-visible md:rounded-none md:border-0 md:shadow-none"
                >
                  {row.map((cell, cellIndex) => {
                    const header = headers[cellIndex];
                    const actions = isActionsColumn(header);

                    return (
                      <td
                        key={cellIndex}
                        className={cn(
                          "flex items-baseline justify-between gap-4 border-b border-slate-200/70 bg-white px-4 py-3 text-right text-sm text-slate-700 max-md:last:border-b-0",
                          "md:table-cell md:text-center md:align-middle md:group-last:border-b-0",
                          // Sombra interna en vez de `bg-*`: tiñe cualquier fondo
                          // de estado que traiga la celda sin reemplazarlo.
                          "transition-shadow md:group-hover:shadow-[inset_0_0_0_9999px_rgba(8,145,178,0.05)]",
                          cellClasses[start + rowIndex]?.[cellIndex],
                        )}
                      >
                        {/*
                        En la tarjeta móvil ninguno de los dos lados parte una
                        palabra si puede evitarlo. Antes la etiqueta quedaba
                        fija al 45% sin poder partir: una palabra más larga se
                        montaba encima del valor, y el valor (con `min-w-0`) se
                        partía aunque fuera un número de documento. Ahora los
                        dos encogen hasta su palabra más larga, y solo si esa
                        palabra pasa del 45% (etiqueta) o del 70% (valor: un
                        correo, una URL) se corta dentro de ella.
                      */}
                        {header && !actions && (
                          <span className="max-w-[45%] break-words text-left text-[11px] font-semibold uppercase tracking-wide text-cyan-700 md:hidden">
                            {header}
                          </span>
                        )}
                        <div
                          className={cn(
                            "break-words md:max-w-none",
                            actions
                              ? ACTIONS_CELL_MOBILE
                              : header
                                ? "max-w-[70%]"
                                : "min-w-0",
                          )}
                        >
                          {cell}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav
          aria-label={t("dataTable.pagination")}
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white px-3 py-2.5 md:mt-0 md:rounded-none md:border-0 md:border-t md:px-5"
        >
          <p className="text-xs text-slate-500">
            {serverPagination
              ? t("dataTable.pageOf", { page, total: pageCount })
              : t("dataTable.showing", {
                  from: start + 1,
                  to: start + visibleRows.length,
                  total: rows.length,
                })}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              aria-label={t("dataTable.previous")}
              className={navButtonClass}
            >
              <IoChevronBack size={16} />
              <span className="hidden sm:inline">
                {t("dataTable.previous")}
              </span>
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageItems(page, pageCount).map((item, i) =>
                item === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goTo(item)}
                    aria-current={item === page ? "page" : undefined}
                    className={cn(
                      navButtonClass,
                      "px-0",
                      item === page &&
                        "bg-cyan-600 text-white shadow-sm hover:bg-cyan-600 hover:text-white",
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <span className="px-2 text-sm font-semibold text-slate-600 sm:hidden">
              {page} / {pageCount}
            </span>

            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === pageCount}
              aria-label={t("dataTable.next")}
              className={navButtonClass}
            >
              <span className="hidden sm:inline">{t("dataTable.next")}</span>
              <IoChevronForward size={16} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
