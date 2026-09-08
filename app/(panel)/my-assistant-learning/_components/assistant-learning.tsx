"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Buton, Text, Title } from "complexes-next-components";
import { FiCheck, FiHelpCircle, FiRefreshCw } from "react-icons/fi";
import { ImSpinner9 } from "react-icons/im";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { HeaderAction } from "@/app/components/header";

import {
  reviewUnknownQueryService,
  unknownQueriesService,
} from "../service/assistantLearningService";
import { UnknownQueryResponse } from "../service/response/unknownQueryResponse";

/**
 * Lo que el asistente no supo responder, de lo más preguntado a lo que menos.
 *
 * Es la lista de trabajo del módulo escrita por los propios usuarios: cada fila
 * es alguien que le pidió algo al asistente y se fue sin respuesta. El backend
 * las venía guardando desde siempre, pero no había por dónde leerlas.
 *
 * El texto es literal —lo que el residente o el empleado escribió—, así que
 * puede llevar nombres, unidades y quejas. Por eso el endpoint solo lo abre al
 * staff administrativo y esta pantalla vive detrás del mismo rol.
 */
export default function AssistantLearning() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const [data, setData] = useState<UnknownQueryResponse[]>([]);
  const [includeReviewed, setIncludeReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Id de la fila que se está marcando, para bloquear solo ese botón. */
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!conjuntoId) return;

    setLoading(true);
    setError(null);

    try {
      setData(await unknownQueriesService(conjuntoId, { includeReviewed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [conjuntoId, includeReviewed]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string) => {
    if (!conjuntoId) return;

    setReviewing(id);

    try {
      await reviewUnknownQueryService(conjuntoId, id);

      // Se quita de la lista en vez de recargar: la fila ya no pertenece al
      // listado pendiente y una recarga entera parpadearía toda la tabla por
      // un cambio de una línea.
      setData((prev) =>
        includeReviewed
          ? prev.map((row) => (row.id === id ? { ...row, reviewed: true } : row))
          : prev.filter((row) => row.id !== id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setReviewing(null);
    }
  };

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <>
      <HeaderAction title="Lo que el asistente no entendió" />

      <div className="lg:px-10 mt-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Text size="sm" className="text-gray-600 dark:text-gray-300">
            Preguntas que el asistente no supo responder, de la más repetida a
            la que menos. Son las que dicen qué le falta por aprender.
          </Text>

          <div className="flex items-center gap-2">
            <Buton
              size="sm"
              borderWidth="none"
              colVariant={includeReviewed ? "primary" : "default"}
              onClick={() => setIncludeReviewed((prev) => !prev)}
              disabled={loading}
            >
              {includeReviewed ? "Viendo todas" : "Ver también revisadas"}
            </Buton>

            <Buton
              size="sm"
              borderWidth="none"
              colVariant="default"
              onClick={load}
              disabled={loading}
            >
              {loading ? <ImSpinner9 className="animate-spin" /> : <FiRefreshCw />}
            </Buton>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center py-6">{error}</div>
        )}

        {loading && !data.length && (
          <div className="flex justify-center py-10 text-gray-500">
            <ImSpinner9 className="animate-spin text-2xl" />
          </div>
        )}

        {/* Vacío no es un fallo: significa que el asistente está respondiendo
            todo lo que le preguntan, que es la meta. */}
        {!loading && !error && !data.length && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-300">
            <FiHelpCircle className="mx-auto text-3xl mb-2 text-green-600" />
            <Text size="sm">
              {includeReviewed
                ? "No hay preguntas registradas todavía."
                : "No hay preguntas pendientes. El asistente está respondiendo todo lo que le preguntan."}
            </Text>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {data.map((row) => (
            <div
              key={row.id}
              className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-wrap items-center gap-4"
            >
              {/* El contador es lo primero que se lee: es lo que decide en qué
                  orden vale la pena atenderlas. */}
              <div className="flex flex-col items-center justify-center min-w-16 px-3 py-2 rounded-lg bg-blue-50 dark:bg-slate-700">
                <Title as="h3" className="text-xl font-bold leading-none">
                  {row.count}
                </Title>
                <Text size="sm" className="text-gray-500">
                  {row.count === 1 ? "vez" : "veces"}
                </Text>
              </div>

              <div className="flex-1 min-w-56">
                <Text size="sm" className="font-medium break-words">
                  “{row.message}”
                </Text>
                <Text size="sm" className="text-gray-500 mt-1">
                  Última vez: {formatDate(row.lastAskedAt)}
                  {row.reviewed && " · revisada"}
                </Text>
              </div>

              {!row.reviewed && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="primary"
                  className="whitespace-nowrap"
                  onClick={() => review(row.id)}
                  disabled={reviewing !== null}
                >
                  {reviewing === row.id ? (
                    <ImSpinner9 className="animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <FiCheck /> Revisada
                    </span>
                  )}
                </Buton>
              )}
            </div>
          ))}
        </div>

        {!!data.length && (
          <Text size="sm" className="text-gray-500 mt-4 block">
            Marcar una como revisada la saca de la lista. Si alguien vuelve a
            preguntarla, reaparece sola.
          </Text>
        )}
      </div>
    </>
  );
}
