"use client";

import React, { useState } from "react";
import { Title, Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { PqrStatus } from "../services/response/pqrResponse";
import usePqrInfo from "./usePqrInfo";
import usePqrAll from "./usePqrAll";
import ModalResolve from "./modal/modal-resolve";

const statusConfig: Record<
  PqrStatus,
  { label: string; className: string }
> = {
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

function EmployeeView() {
  const { data, BASE_URL } = usePqrAll();
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
              const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
                /^.*[\\/]/,
                "",
              )}`;
              const status = item.status ?? "pendiente";
              const badge = statusConfig[status];

              return (
                <div
                  key={item.id}
                  className="border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Title
                      as="h3"
                      className="text-lg font-semibold text-gray-800 capitalize"
                    >
                      {item.type.replace(/_/g, " ")}
                    </Title>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <Text className="text-sm text-gray-500">
                        {item.radicado}
                      </Text>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-2 space-y-1">
                    <p>
                      Torre: <span className="font-medium">{item.tower}</span>{" "}
                      — Apto:{" "}
                      <span className="font-medium">{item.apartment}</span>
                    </p>
                  </div>

                  <div className="w-full h-[300px] rounded-lg overflow-hidden border">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Ver PDF completo
                    </a>
                    <button
                      onClick={() => openModal(item.id, item.radicado)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Dar respuesta
                    </button>
                  </div>
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
  const { data, BASE_URL } = usePqrInfo();

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      {!data || data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((item) => {
            const pdfUrl = `${BASE_URL}/uploads/pdfs/${item.file.replace(
              /^.*[\\/]/,
              "",
            )}`;
            const status = item.status ?? "pendiente";
            const badge = statusConfig[status];
            const isResolved =
              status === "aceptada" || status === "rechazada";

            return (
              <div
                key={item.id}
                className="border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex flex-col bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <Title
                    as="h3"
                    className="text-lg font-semibold text-gray-800 capitalize"
                  >
                    {item.type.replace(/_/g, " ")}
                  </Title>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <Text className="text-sm text-gray-500">
                      {item.radicado}
                    </Text>
                  </div>
                </div>

                <div className="w-full h-[300px] rounded-lg overflow-hidden border">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>

                <div className="mt-3">
                  {isResolved && item.resolution ? (
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        status === "aceptada"
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      <p className="font-semibold mb-1">
                        Respuesta de administración:
                      </p>
                      <p>{item.resolution}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg p-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800">
                      En revisión por la administración
                    </div>
                  )}
                </div>

                <div className="mt-3 text-right">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Ver PDF completo
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AllInfoPqr() {
  const payload = getTokenPayload();
  const isEmployee = payload?.roles?.includes("employee");

  return isEmployee ? <EmployeeView /> : <OwnerView />;
}
