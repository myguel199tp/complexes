"use client";

import React, { useState } from "react";
import {
  Badge,
  Buton,
  InputField,
  Table,
  Text,
  Tooltip,
} from "complexes-next-components";
import { FaEdit } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import useActivityTable from "./table-info";
import MessageNotData from "@/app/components/messageNotData";
import { MdDeleteForever } from "react-icons/md";
import ModalRemove from "./modal/modal-remove";
import ModalEdit from "./modal/modal-edit";

export default function Tables() {
  const { data, error, filterText, setFilterText, t, language } =
    useActivityTable();

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    t("titulo"),
    t("nombreUnidad"),
    t("inicioHora"),
    t("finHora"),
    t("descripcion"),
    t("acciones"),
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText.toLowerCase();
      return (
        String(user.activity)?.toLowerCase().includes(filterLower) ||
        String(user.nameUnit)?.toLowerCase().includes(filterLower) ||
        String(user.dateHourStart)?.toLowerCase().includes(filterLower) ||
        String(user.dateHourEnd)?.toLowerCase().includes(filterLower) ||
        String(user.description)?.toLowerCase().includes(filterLower)
      );
    })
    .map((user, index) => [
      user.activity || "",
      user.nameUnit || "",
      user.dateHourStart || "",
      user.dateHourEnd || "",
      // 🔽 DESCRIPCIÓN CON VER MÁS / VER MENOS
      <div key={`desc-${index}`} className="text-sm text-gray-700">
        <span className={!expandedRows[index] ? "line-clamp-3" : ""}>
          {user.description}
        </span>

        {user.description?.length > 100 && (
          <button
            onClick={() => toggleExpand(index)}
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            {!expandedRows[index] ? t("vermas") : t("vermenos")}
          </button>
        )}
      </div>,
      // 🔽 ACCIONES
      <div
        key={`actions-${user.id}`}
        className="flex justify-center items-center gap-2"
      >
        <Tooltip content={t("editar")} className="bg-gray-200">
          <Buton
            colVariant="primary"
            borderWidth="none"
            onClick={() => {
              setOpenModalEdit(true);
            }}
          >
            <FaEdit color="blue" size={20} />
          </Buton>
        </Tooltip>

        <Tooltip content={t("eliminar")} className="bg-gray-200">
          <Buton
            colVariant="primary"
            borderWidth="none"
            onClick={() => {
              setOpenModalRemove(true);
            }}
          >
            <MdDeleteForever color="red" size={20} />
          </Buton>
        </Tooltip>
      </div>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700")
  );

  return (
    <div key={language} className="w-full p-4">
      {/* 🏷 Badge */}
      <div className="flex gap-4">
        <Badge
          background="primary"
          rounded="lg"
          tKey={t("actividadesRegistradas")}
          role="contentinfo"
        >
          {t("actividadesRegistradas")}:{" "}
          <Text as="span" font="bold">
            {filteredRows.length}
          </Text>
        </Badge>
      </div>
      {/* 🔍 Search */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder={t("buscarNoticia")}
          helpText={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
      {/* 📋 Tabla */}
      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          borderColor="text-gray-500"
          cellClasses={cellClasses}
          columnWidths={["20%", "20%", "15%", "15%", "20%", "10%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
      {/* MODAL ELIMINAR */}
      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
      />
      <ModalEdit
        isOpen={openModalEdit}
        onClose={() => setOpenModalEdit(false)}
      />
    </div>
  );
}
