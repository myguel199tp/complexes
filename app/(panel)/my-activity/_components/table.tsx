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

  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [selectedstartHour, setSelectedStartHour] = useState<Date>();
  const [selectedEndHour, setSelectedEndHour] = useState<Date>();
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [selectedCuantity, setSelectedCuantity] = useState<number>(0);

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    t("titulo"),
    "Cantidad",
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
        String(user.cuantity)?.toLowerCase().includes(filterLower) ||
        String(user.dateHourStart)?.toLowerCase().includes(filterLower) ||
        String(user.dateHourEnd)?.toLowerCase().includes(filterLower) ||
        String(user.description)?.toLowerCase().includes(filterLower)
      );
    })
    .map((user, index) => [
      user.activity || "",
      user.cuantity || "",
      user.dateHourStart || "",
      user.dateHourEnd || "",
      // 🔽 DESCRIPCIÓN
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
              setSelectedId(String(user.id));
              setSelectedActivity(user.activity);
              setSelectedStartHour(
                user.dateHourStart ? new Date(user.dateHourStart) : undefined
              );
              setSelectedEndHour(
                user.dateHourEnd ? new Date(user.dateHourEnd) : undefined
              );
              setSelectedDescription(user.description);
              setSelectedCuantity(user.cuantity);
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
            onClick={() => setOpenModalRemove(true)}
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

      {/* 🧨 Modal eliminar */}
      <ModalRemove
        isOpen={openModalRemove}
        onClose={() => setOpenModalRemove(false)}
      />

      {/* ✏️ Modal editar */}
      <ModalEdit
        isOpen={openModalEdit}
        onClose={() => setOpenModalEdit(false)}
        activity={selectedActivity}
        id={selectedId}
        startHour={selectedstartHour}
        endHour={selectedEndHour}
        description={selectedDescription}
        cuantity={selectedCuantity}
      />
    </div>
  );
}
