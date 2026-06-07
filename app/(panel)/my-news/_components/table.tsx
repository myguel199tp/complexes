"use client";

import { Buton, InputField, Table, Tooltip } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { allNewsService } from "../services/newsAllServices";
import { NewsResponse } from "../services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import { useLanguage } from "@/app/hooks/useLanguage";
import MessageNotConnect from "@/app/components/messageNotInfo";
import { FaEdit } from "react-icons/fa";
import ModalEdit from "./modal/modal-edit";

export default function Tables() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (!conjuntoId) return;

    const fetchData = async () => {
      try {
        const result = await allNewsService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  if (error) return <MessageNotConnect />;

  const headers = [t("titulo"), t("mensajes"), t("correo"), t("acciones")];

  const filteredRows = data
    .filter((item) => {
      const filter = filterText.toLowerCase();
      return (
        item.title?.toLowerCase().includes(filter) ||
        item.textmessage?.toLowerCase().includes(filter) ||
        item.mailAdmin?.toLowerCase().includes(filter)
      );
    })
    .map((item, index) => [
      item.title || "",

      <div key={index}>
        <span className={!expandedRows[index] ? "line-clamp-2" : ""}>
          {item.textmessage}
        </span>
        <button
          onClick={() => toggleExpand(index)}
          className="ml-2 text-blue-500 hover:underline text-sm"
        >
          {!expandedRows[index] ? t("vermas") : t("vermenos")}
        </button>
      </div>,

      item.mailAdmin || "",

      <div key={item.id} className="flex justify-center">
        <Tooltip content={t("editar")}>
          <Buton
            colVariant="primary"
            borderWidth="none"
            onClick={() => {
              setSelectedNews(item);
              setOpenModalEdit(true);
            }}
          >
            <FaEdit size={18} />
          </Buton>
        </Tooltip>
      </div>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div key={language} className="w-full mt-2">
      {/* 🔍 BUSCADOR */}
      <div className="flex gap-4 mb-4 w-full">
        <InputField
          placeholder={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={16} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full"
        />
      </div>

      {/* 📊 TABLA */}
      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          cellClasses={cellClasses}
          borderColor="text-gray-300"
          columnWidths={["25%", "45%", "20%", "10%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}

      {/* ✏️ MODAL */}
      {selectedNews && (
        <ModalEdit
          isOpen={openModalEdit}
          onClose={() => {
            setOpenModalEdit(false);
            setSelectedNews(null);
          }}
          id={String(selectedNews.id)}
          title={selectedNews.title || ""}
          textmessage={selectedNews.textmessage || ""}
          nameUnit={selectedNews.nameUnit || ""}
          mailAdmin={selectedNews.mailAdmin || ""}
          conjuntoId={selectedNews.conjuntoId || ""}
          fileUrl={selectedNews.file}
        />
      )}
    </div>
  );
}
