"use client";

import React, { useState } from "react";
import { Title, Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { useTokenPayload } from "@/app/components/session-provider";
import { PqrStatus } from "../services/response/pqrResponse";
import usePqrInfo from "./usePqrInfo";
import usePqrAll from "./usePqrAll";
import ModalResolve from "./modal/modal-resolve";
import {
  ProtectedFile,
  ProtectedFilePlaceholder,
} from "@/app/components/protected-file";
import { PqrEvidenceBlock } from "@/app/components/pqr-evidence";

const statusConfig: Record<PqrStatus, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800",
  },
  en_proceso: {
    label: "En proceso",
    className: "bg-blue-100 text-blue-800",
  },
  aceptada: {
    label: "Aceptada",
    className: "bg-green-100 text-green-800",
  },
  rechazada: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800",
  },
};

/**
 * Tipo y estado arriba, radicado debajo. Antes iban los tres en una sola fila
 * sin salto, y en el teléfono el radicado se salía de la tarjeta.
 */
function PqrCardHeader({
  type,
  status,
  radicado,
}: {
  type: string;
  status: PqrStatus;
  radicado: string;
}) {
  const badge = statusConfig[status];

  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Title
          as="h3"
          className="min-w-0 break-words text-lg font-semibold text-gray-800 capitalize"
        >
          {type.replace(/_/g, " ")}
        </Title>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <Text className="mt-1 break-all text-sm text-gray-500">{radicado}</Text>
    </div>
  );
}

function PqrPdfPreview({
  url,
  failed,
}: {
  url: string | null;
  failed: boolean;
}) {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border">
      {url ? (
        <iframe src={url} className="w-full h-full" style={{ border: "none" }} />
      ) : (
        <ProtectedFilePlaceholder failed={failed} className="h-full" />
      )}
    </div>
  );
}

function PqrPdfLink({ url }: { url: string | null }) {
  return (
    <a
      href={url ?? undefined}
      aria-disabled={!url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:underline text-sm font-medium ${
        url ? "" : "pointer-events-none opacity-60"
      }`}
    >
      Ver PDF completo
    </a>
  );
}

function EmployeeView() {
  const { data } = usePqrAll();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRadicado, setSelectedRadicado] = useState<string>("");

  const openModal = (id: string, radicado: string) => {
    setSelectedId(id);
    setSelectedRadicado(radicado);
  };

  const closeModal = () => {
    setSelectedId(null);
    setSelectedRadicado("");
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 mt-6">
        {!data || data.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <MessageNotData />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.map((item) => {
              const status = item.status ?? "pendiente";

              return (
                <div
                  key={item.id}
                  className="border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col bg-white"
                >
                  <PqrCardHeader
                    type={item.type}
                    status={status}
                    radicado={item.radicado}
                  />

                  <div className="text-xs text-gray-500 mb-2 space-y-1">
                    <Text size="sm">
                      Torre: <span className="font-medium">{item.tower}</span> —
                      Apto:{" "}
                      <span className="font-medium">{item.apartment}</span>
                    </Text>
                  </div>

                  <ProtectedFile stored={item.file}>
                    {({ url: pdfUrl, failed }) => (
                      <>
                        <PqrPdfPreview url={pdfUrl} failed={failed} />

                        <PqrEvidenceBlock
                          pqrId={item.id}
                          evidence={item.evidence}
                          className="mt-3"
                        />

                        <div className="mt-3 flex items-center justify-between">
                          <PqrPdfLink url={pdfUrl} />
                          <button
                            onClick={() => openModal(item.id, item.radicado)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            Dar respuesta
                          </button>
                        </div>
                      </>
                    )}
                  </ProtectedFile>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedId && (
        <ModalResolve
          isOpen={!!selectedId}
          onClose={closeModal}
          id={selectedId}
          radicado={selectedRadicado}
        />
      )}
    </>
  );
}

function OwnerView() {
  const { data } = usePqrInfo();

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      {!data || data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((item) => {
            const status = item.status ?? "pendiente";
            const isResolved = status === "aceptada" || status === "rechazada";

            return (
              <div
                key={item.id}
                className="border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col bg-white"
              >
                <PqrCardHeader
                  type={item.type}
                  status={status}
                  radicado={item.radicado}
                />

                <ProtectedFile stored={item.file}>
                  {({ url: pdfUrl, failed }) => (
                    <>
                      <PqrPdfPreview url={pdfUrl} failed={failed} />

                      <PqrEvidenceBlock
                        pqrId={item.id}
                        evidence={item.evidence}
                        className="mt-3"
                      />

                      <div className="mt-3">
                        {isResolved && item.resolution ? (
                          <div
                            className={`rounded-lg p-3 text-sm ${
                              status === "aceptada"
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-red-50 border border-red-200 text-red-800"
                            }`}
                          >
                            <Text size="sm" font="semi" className="mb-1">
                              Respuesta de administración:
                            </Text>
                            <Text size="sm">{item.resolution}</Text>
                          </div>
                        ) : (
                          <div className="rounded-lg p-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800">
                            En revisión por la administración
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-right">
                        <PqrPdfLink url={pdfUrl} />
                      </div>
                    </>
                  )}
                </ProtectedFile>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AllInfoPqr() {
  const payload = useTokenPayload();
  const isEmployee = payload?.roles?.includes("employee");

  return isEmployee ? <EmployeeView /> : <OwnerView />;
}
