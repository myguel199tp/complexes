"use client";

import { Table } from "@/app/components/ui/table";
import React, { useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import MessageNotData from "@/app/components/messageNotData";
import { useInfoPqrQuery } from "./useInfoPqr";
import { AllPqrStatus } from "../services/response/AllPqrResponse";
import ModalResolveAll from "./modal/modal-resolve";
import { PqrEvidence } from "@/app/components/pqr-evidence";
import { InputField } from "@/app/components/ui/form";

const statusConfig: Record<AllPqrStatus, { label: string; className: string }> =
  {
    pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
    en_proceso: { label: "En proceso", className: "bg-blue-100 text-blue-800" },
    aceptada: { label: "Aceptada", className: "bg-green-100 text-green-800" },
    rechazada: { label: "Rechazada", className: "bg-red-100 text-red-800" },
  };

export default function Tables() {
  const { data, error } = useInfoPqrQuery();
  const [filterText, setFilterText] = useState("");
  const { t } = useTranslation();
  const { language } = useLanguage();
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

  if (error) {
    return <div>{t("errorDesconocido")}</div>;
  }

  if (!data || data?.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <MessageNotData />
      </div>
    );
  }

  const headers = [
    t("tipo"),
    t("radicado"),
    t("torre"),
    t("apartamento"),
    t("archivoPdf"),
    "Imagen",
    "Estado",
    "Acciones",
  ];

  const filteredData = data?.filter(
    (pqr) =>
      pqr.type.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.description.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.tower?.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.apartment?.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.radicado?.toLowerCase().includes(filterText.toLowerCase()),
  );

  const rows = filteredData.map((pqr) => {
    const status = pqr.status ?? "pendiente";
    const badge = statusConfig[status];

    return [
      pqr.type || "",
      pqr.radicado || "",
      pqr.tower || "",
      pqr.apartment || "",
      pqr.file ? (
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/${pqr.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-800 underline"
        >
          {t("verPdf")}
        </a>
      ) : (
        t("sinArchivo")
      ),
      <PqrEvidence
        key="evidence"
        pqrId={pqr.id}
        hasEvidence={!!pqr.evidence}
      />,
      <span
        key="badge"
        className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${badge.className}`}
      >
        {badge.label}
      </span>,
      <button
        key="action"
        onClick={() => openModal(pqr.id, pqr.radicado)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Dar respuesta
      </button>,
    ];
  });

  const cellClasses = filteredData.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <>
      <div key={language} className="w-full p-4">
        <div className="flex gap-4 mt-2 w-full">
          <div className="relative flex-1">
            <IoSearchCircle
              size={24}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <InputField
              regexType="safeChars"
              placeholder={t("buscarNoticia")}
              helpText={t("buscarNoticia")}
              value={filterText}
              sizeHelp="sm"
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <Table
          headers={headers}
          rows={rows}
          cellClasses={cellClasses}
          columnWidths={["15%", "13%", "10%", "10%", "11%", "11%", "12%", "18%"]}
        />
      </div>

      {selectedId && (
        <ModalResolveAll
          isOpen={!!selectedId}
          onClose={closeModal}
          id={selectedId}
          radicado={selectedRadicado}
        />
      )}
    </>
  );
}
