"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Text } from "complexes-next-components";

import {
  CollectionAgreement,
  CollectionAgreementService,
  PROVIDER_LABEL,
} from "../../services/collectionAgreementService";

type Props = {
  conjuntoId: string;
  agreement: CollectionAgreement;
  onClose: () => void;
};

/**
 * La lista de referencias emitidas, con descarga en CSV.
 *
 * El CSV no es un extra: hay convenios en los que el banco pide cargar la base
 * de referencias antes de habilitar el recaudo, y el conjunto necesita repartir
 * la referencia a cada unidad —impresa en el recibo o pegada en la cartelera—.
 * Sin poder sacar la lista, la única salida sería copiarla de la pantalla.
 */
export default function CollectionReferencesModal({
  conjuntoId,
  agreement,
  onClose,
}: Props) {
  const { data: references = [], isLoading } = useQuery({
    queryKey: ["query_key_collection_references", agreement.id],
    queryFn: () =>
      CollectionAgreementService.listReferences(agreement.id, conjuntoId),
  });

  const downloadCsv = () => {
    // Se cita todo: "Torre A, interior 2" con coma dentro partiría la fila, y
    // las referencias con ceros a la izquierda hay que preservarlas tal cual.
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = [
      ["Torre", "Apartamento", "Referencia"],
      ...references.map((reference) => [
        reference.tower ?? "",
        reference.apartment,
        reference.reference,
      ]),
    ];

    const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");

    // BOM para que Excel abra las tildes bien: sin él "Ñ" y "ó" salen rotas y
    // el administrador cree que los datos están mal.
    const blob = new Blob([`﻿${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `referencias-${agreement.agreementCode}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-3 rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <Text font="bold">Referencias emitidas</Text>

            <Text size="xs" className="text-gray-500">
              {agreement.displayName ?? PROVIDER_LABEL[agreement.provider]} ·
              convenio {agreement.agreementCode}
            </Text>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        {isLoading ? (
          <Text size="xs" className="text-gray-500">
            Cargando referencias…
          </Text>
        ) : (
          <>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={references.length === 0}
              className="self-start rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              Descargar CSV
            </button>

            <div className="overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2">Torre</th>
                    <th className="px-3 py-2">Apartamento</th>
                    <th className="px-3 py-2">Referencia</th>
                  </tr>
                </thead>

                <tbody>
                  {references.map((reference) => (
                    <tr key={reference.id} className="border-t">
                      <td className="px-3 py-2">{reference.tower ?? "—"}</td>
                      <td className="px-3 py-2">{reference.apartment}</td>
                      <td className="px-3 py-2 font-mono">
                        {reference.reference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
